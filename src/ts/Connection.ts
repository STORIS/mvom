import path from 'path';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import fs from 'fs-extra';
import moment from 'moment';
import semver from 'semver';
import {
	dbErrors,
	ISOCalendarDateFormat,
	ISOCalendarDateTimeFormat,
	ISOTimeFormat,
	mvEpoch,
} from '#shared/constants';
import {
	ConnectionManagerError,
	DbServerError,
	ForeignKeyValidationError,
	InvalidParameterError,
	InvalidServerFeaturesError,
	RecordLockedError,
	RecordVersionError,
} from '#shared/errors';
import type {
	DbActionInputCreateDir,
	DbActionInputDeploy,
	DbActionInputFeatureList,
	DbActionInputSubroutine,
	DbActionInputTypes,
	DbActionOutputErrorForeignKey,
	DbActionResponseCreateDir,
	DbActionResponseDeploy,
	DbActionResponseError,
	DbActionResponseFeatureList,
	DbActionSubroutineInputTypes,
	DbFeatureResponseTypes,
	DbSubroutineInputOptionsMap,
	DbSubroutineResponseTypes,
	DbSubroutineResponseTypesMap,
	GenericObject,
	Logger,
} from '#shared/types';
import { dummyLogger } from '#shared/utils';
import { dependencies as serverDependencies } from '../.mvomrc.json';
import compileModel, { type ModelConstructor } from './compileModel';
import type Schema from './Schema';

export enum ConnectionStatus {
	// convert to enum when transitioning class to TS
	disconnected = 'disconnected',
	connected = 'connected',
	connecting = 'connecting',
}

export interface CreateConnectionOptions {
	/** Optional logger instance */
	logger?: Logger;
	/**
	 * Lifetime of cache of db server data (s)
	 * @defaultValue 3600
	 */
	cacheMaxAge?: number;
	/**
	 * Request timeout (ms)
	 * 0 implies no timeout
	 * @defaultValue 0
	 */
	timeout?: number;
}

export interface DeployFeaturesOptions {
	/**
	 * Create directory when deploying features
	 * @defaultValue false
	 */
	createDir?: boolean;
}

type ServerDependency = keyof typeof serverDependencies;

interface ServerFeatureSet {
	validFeatures: Map<ServerDependency, string>;
	invalidFeatures: Set<ServerDependency>;
}

/** A connection object */
class Connection {
	/** File system path of the UniBasic source code */
	private static unibasicPath = path.resolve(path.join(__dirname, '../', 'unibasic'));

	/** Connection status */
	public status: ConnectionStatus = ConnectionStatus.disconnected;

	/** Logger instance used for diagnostic logging */
	public logger: Logger;

	/** Object providing the current state of db server features and availability */
	private serverFeatureSet: ServerFeatureSet = {
		validFeatures: new Map(),
		invalidFeatures: new Set(),
	};

	/** Time that the connection information cache will expire */
	private cacheExpiry = 0;

	/** Maximum age of the cache before it must be refreshed */
	private cacheMaxAge: number;

	/** URI of the full endpoint for communicating with the database */
	private endpoint: string;

	/** +/- in milliseconds between database server time and local server time */
	private timeDrift?: number;

	/** Request timeout, in milliseconds */
	private timeout: number;

	private constructor(
		/** URI of the MVIS which facilitates access to the mv database */
		mvisUri: string,
		/** Database account that connection will be used against */
		account: string,
		/** Logger instance */
		logger: Logger,
		/** Lifetime of cache of db server data (s) */
		cacheMaxAge: number,
		/** Request timeout (ms) */
		timeout: number,
	) {
		this.logger = logger;
		this.cacheMaxAge = cacheMaxAge;
		this.endpoint = `${mvisUri}/${account}/subroutine/${Connection.getServerProgramName('entry')}`;
		this.timeout = timeout;

		logger.debug(`creating new connection instance`);
	}

	public static createConnection(
		/** URI of the MVIS which facilitates access to the mv database */
		mvisUri: string,
		/** Database account that connection will be used against */
		account: string,
		options: CreateConnectionOptions = {},
	): Connection {
		const { logger = dummyLogger, cacheMaxAge = 3600, timeout = 0 } = options;

		if (!Number.isInteger(cacheMaxAge)) {
			throw new InvalidParameterError({ parameterName: 'cacheMaxAge' });
		}

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		return new Connection(mvisUri, account, logger, cacheMaxAge, timeout);
	}

	/** Return the packaged specific version number of a feature */
	private static getFeatureVersion(feature: ServerDependency): string {
		const featureVersion = semver.minVersion(serverDependencies[feature]);
		if (featureVersion == null) {
			throw new TypeError('Server feature dependency list is corrupted');
		}

		return featureVersion.version;
	}

	/** Get the exact name of a feature subroutine on the database server */
	private static getServerProgramName(feature: ServerDependency, version?: string): string {
		const featureVersion = version ?? Connection.getFeatureVersion(feature);
		return `mvom_${feature}@${featureVersion}`;
	}

	/** Get the UniBasic source code for a given feature */
	private static async getUnibasicSource(feature: ServerDependency): Promise<string> {
		const filePath = path.join(Connection.unibasicPath, `${feature}.mvb`);
		return fs.readFile(filePath, 'utf8');
	}

	/**
	 * Handle error from the database server
	 * @throws {@link ForeignKeyValidationError} A foreign key constraint was violated
	 * @throws {@link RecordLockedError} A record was locked and could not be updated
	 * @throws {@link RecordVersionError} A record changed between being read and written and could not be updated
	 * @throws {@link DbServerError} An error was encountered on the database server
	 */
	private static handleDbServerError<TResponse extends DbFeatureResponseTypes>(
		response: AxiosResponse<TResponse | DbActionResponseError>,
	): asserts response is AxiosResponse<TResponse> {
		if (response.data.output == null) {
			// handle invalid response
			throw new DbServerError({ message: 'Response from db server was malformed' });
		}

		if ('errorCode' in response.data.output) {
			const errorCode = Number(response.data.output.errorCode);
			switch (errorCode) {
				case dbErrors.foreignKeyValidation.code:
					throw new ForeignKeyValidationError({
						foreignKeyValidationErrors: (response.data.output as DbActionOutputErrorForeignKey)
							.foreignKeyValidationErrors,
					});
				case dbErrors.recordLocked.code:
					throw new RecordLockedError();
				case dbErrors.recordVersion.code:
					throw new RecordVersionError();
				default:
					throw new DbServerError({ errorCode: response.data.output.errorCode });
			}
		}
	}

	/** Open a database connection */
	public async open(): Promise<void> {
		this.logger.debug(`opening connection`);
		this.status = ConnectionStatus.connecting;
		await this.getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.size > 0) {
			// prevent connection attempt if features are invalid
			this.logger.verbose(`invalid features found: ${this.serverFeatureSet.invalidFeatures}`);
			this.logger.debug('connection will not be opened');
			this.status = ConnectionStatus.disconnected;
			throw new InvalidServerFeaturesError({
				invalidFeatures: Array.from(this.serverFeatureSet.invalidFeatures),
			});
		}

		await this.getDbServerInfo(); // establish baseline for database server information

		this.logger.debug(`connection opened`);
		this.status = ConnectionStatus.connected;
	}

	/** Deploy database features */
	public async deployFeatures(
		sourceDir: string,
		options: DeployFeaturesOptions = {},
	): Promise<void> {
		const { createDir = false } = options;
		this.logger.debug(`deploying features to directory ${sourceDir}`);

		await this.getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.size === 0) {
			// there aren't any invalid features to deploy
			this.logger.debug(`no missing features to deploy`);
			return;
		}

		if (createDir) {
			// create deployment directory (if necessary)
			this.logger.debug(`creating deployment directory ${sourceDir}`);
			const data: DbActionInputCreateDir = {
				action: 'createDir',
				dirName: sourceDir,
			};
			await this.executeDb(data);
		}

		const bootstrapFeatures: ServerDependency[] = ['deploy', 'setup', 'teardown'];
		const bootstrapped = await Promise.all(
			bootstrapFeatures.map(async (feature) => {
				if (this.serverFeatureSet.validFeatures.has(feature)) {
					return false;
				}

				this.logger.debug(`deploying the "${feature}" feature to ${sourceDir}`);
				const data: DbActionInputDeploy = {
					action: 'deploy',
					sourceDir,
					source: await Connection.getUnibasicSource(feature),
					programName: Connection.getServerProgramName(feature),
				};

				await this.executeDb(data);
				return true;
			}),
		);

		if (bootstrapped.includes(true)) {
			// Bootstrap features needed for the deployment feature were installed, restart the deployment process
			await this.deployFeatures(sourceDir, options);
			return;
		}

		// deploy any other missing features
		await Promise.all(
			Array.from(this.serverFeatureSet.invalidFeatures).map(async (feature) => {
				this.logger.debug(`deploying ${feature} to ${sourceDir}`);
				const executeDbFeatureOptions = {
					sourceDir,
					source: await Connection.getUnibasicSource(feature),
					programName: Connection.getServerProgramName(feature),
				};
				await this.executeDbFeature('deploy', executeDbFeatureOptions);
			}),
		);
	}

	/** Execute a database feature */
	public async executeDbFeature<
		TFeature extends keyof (DbSubroutineInputOptionsMap & DbSubroutineResponseTypesMap),
	>(
		feature: TFeature,
		options: DbSubroutineInputOptionsMap[TFeature],
		setupOptions: Record<string, never> = {},
		teardownOptions: Record<string, never> = {},
	): Promise<DbSubroutineResponseTypesMap[TFeature]['output']> {
		this.logger.debug(`executing database feature "${feature}"`);

		const featureVersion = this.serverFeatureSet.validFeatures.get(feature);
		const setupVersion = this.serverFeatureSet.validFeatures.get('setup');
		const teardownVersion = this.serverFeatureSet.validFeatures.get('teardown');

		const data: DbActionInputSubroutine<DbSubroutineInputOptionsMap[TFeature]> = {
			action: 'subroutine',
			// make sure to use the compatible server version of feature
			subroutineId: Connection.getServerProgramName(feature, featureVersion),
			setupId: Connection.getServerProgramName('setup', setupVersion),
			teardownId: Connection.getServerProgramName('teardown', teardownVersion),
			options,
			setupOptions,
			teardownOptions,
		};

		this.logger.debug(`executing database subroutine ${data.subroutineId}`);

		return this.executeDb(data);
	}

	/** Get the current ISOCalendarDate from the database */
	public async getDbDate(): Promise<string> {
		await this.getDbServerInfo();
		return moment().add(this.timeDrift).format(ISOCalendarDateFormat);
	}

	/** Get the current ISOCalendarDateTime from the database */
	public async getDbDateTime(): Promise<string> {
		await this.getDbServerInfo();
		return moment().add(this.timeDrift).format(ISOCalendarDateTimeFormat);
	}

	/** Get the current ISOTime from the database */
	public async getDbTime(): Promise<string> {
		await this.getDbServerInfo();
		return moment().add(this.timeDrift).format(ISOTimeFormat);
	}

	/** Define a new model */
	public model<TSchema extends GenericObject>(
		schema: Schema | null,
		file: string,
	): ModelConstructor {
		if (this.status !== ConnectionStatus.connected) {
			throw new Error('Cannot create model until database connection has been established.');
		}
		return compileModel<TSchema>(this, schema, file);
	}

	/** Execute a database function remotely */
	private async executeDb(
		data: DbActionInputFeatureList,
	): Promise<DbActionResponseFeatureList['output']>;
	private async executeDb(
		data: DbActionInputCreateDir,
	): Promise<DbActionResponseCreateDir['output']>;
	private async executeDb(data: DbActionInputDeploy): Promise<DbActionResponseDeploy['output']>;
	private async executeDb(
		data: DbActionSubroutineInputTypes,
	): Promise<DbSubroutineResponseTypes['output']>;
	private async executeDb(data: DbActionInputTypes): Promise<DbFeatureResponseTypes['output']> {
		this.logger.debug(`executing database function with action "${data.action}"`);

		let response;
		try {
			response = await axios.post<DbFeatureResponseTypes | DbActionResponseError>(
				this.endpoint,
				{ input: data },
				{ timeout: this.timeout },
			);
		} catch (err) {
			throw new ConnectionManagerError({
				message: err.message,
				connectionManagerRequest: err.request,
				connectionManagerResponse: err.response,
			});
		}

		Connection.handleDbServerError(response);

		// return the relevant portion from the db server response
		return response.data.output;
	}

	/** Get the db server information (date, time, etc.) */
	private async getDbServerInfo() {
		if (Date.now() > this.cacheExpiry) {
			this.logger.debug('getting db server information');
			const data = await this.executeDbFeature('getServerInfo', {});

			const { date, time } = data;

			this.timeDrift = moment(mvEpoch).add(date, 'days').add(time, 'ms').diff(moment());

			this.cacheExpiry = Date.now() + this.cacheMaxAge * 1000;
		}
	}

	/** Get the state of database server features */
	private getFeatureState = async () => {
		this.logger.debug(`getting state of database server features`);
		const serverFeatures = await this.getServerFeatures();

		this.serverFeatureSet = Object.entries(serverDependencies).reduce<ServerFeatureSet>(
			(acc, entry) => {
				const [dependencyName, dependencyVersion] = entry as [ServerDependency, string];

				const featureVersions = serverFeatures.get(dependencyName);

				if (featureVersions == null) {
					// if the feature doesn't exist on the server then it is invalid
					acc.invalidFeatures.add(dependencyName);
					return acc;
				}

				const matchedVersion = semver.maxSatisfying(featureVersions, dependencyVersion);
				if (matchedVersion == null) {
					// no versions satisfy the requirement
					acc.invalidFeatures.add(dependencyName);
					return acc;
				}

				// return the match as a valid feature
				acc.validFeatures.set(dependencyName, matchedVersion);
				return acc;
			},
			{
				validFeatures: new Map(),
				invalidFeatures: new Set(),
			},
		);
	};

	/** Get a list of database server features */
	private getServerFeatures = async (): Promise<Map<string, string[]>> => {
		this.logger.debug(`getting list of features from database server`);
		const data = { action: 'featureList' } as const;
		const response = await this.executeDb(data);

		return response.features.reduce((acc, feature) => {
			const featureRegExp = /^mvom_(.*)@(\d\.\d\.\d.*$)/;

			const match = featureRegExp.exec(feature);
			if (match == null) {
				// does not match the format of an mvom feature program
				return acc;
			}

			const [, featureName, featureVersion] = match;

			if (semver.valid(featureVersion) == null) {
				// a valid feature will contain an @-version specification that uses semver
				return acc;
			}

			this.logger.debug(
				`feature "${featureName}" version "${featureVersion}" found on database server`,
			);

			const versions = acc.get(featureName) ?? [];
			versions.push(featureVersion);

			acc.set(featureName, versions);
			return acc;
		}, new Map<string, string[]>());
	};
}

export default Connection;
