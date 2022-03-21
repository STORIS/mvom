import path from 'path';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { addDays, addMilliseconds, differenceInMilliseconds, format } from 'date-fns';
import fs from 'fs-extra';
import semver from 'semver';
import { dependencies as serverDependencies } from './.mvomrc.json';
import compileModel, { type ModelConstructor } from './compileModel';
import {
	dbErrors,
	ISOCalendarDateFormat,
	ISOCalendarDateTimeFormat,
	ISOTimeFormat,
	mvEpoch,
} from './constants';
import {
	DbServerError,
	ForeignKeyValidationError,
	InvalidParameterError,
	InvalidServerFeaturesError,
	MvisError,
	RecordLockedError,
	RecordVersionError,
	TimeoutError,
	UnknownError,
} from './errors';
import type Schema from './Schema';
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
} from './types';
import { dummyLogger } from './utils';

// #region Types
export interface Logger {
	error(message: string): void;
	warn(message: string): void;
	info(message: string): void;
	verbose(message: string): void;
	debug(message: string): void;
	silly(message: string): void;
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

export enum ConnectionStatus {
	// convert to enum when transitioning class to TS
	disconnected = 'disconnected',
	connected = 'connected',
	connecting = 'connecting',
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
// #endregion

/** A connection object */
class Connection {
	/** File system path of the UniBasic source code */
	private static readonly unibasicPath = path.resolve(path.join(__dirname, 'unibasic'));

	/** Connection status */
	public status: ConnectionStatus = ConnectionStatus.disconnected;

	/** Database account name */
	private readonly account: string;

	/** Logger instance used for diagnostic logging */
	private readonly logger: Logger;

	/** Object providing the current state of db server features and availability */
	private serverFeatureSet: ServerFeatureSet = {
		validFeatures: new Map(),
		invalidFeatures: new Set(),
	};

	/** Time that the connection information cache will expire */
	private cacheExpiry = 0;

	/** Maximum age of the cache before it must be refreshed */
	private readonly cacheMaxAge: number;

	/** +/- in milliseconds between database server time and local server time */
	private timeDrift = 0;

	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

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
		this.account = account;
		this.logger = logger;
		this.cacheMaxAge = cacheMaxAge;

		const baseURL = `${mvisUri}/${account}/subroutine/${Connection.getServerProgramName('entry')}`;

		this.axiosInstance = axios.create({
			baseURL,
			timeout,
			transitional: { clarifyTimeoutError: true },
		});

		this.logMessage('debug', 'creating new connection instance');
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
		/* istanbul ignore if: Cannot test without corrupting the feature dependency list */
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

	/** Open a database connection */
	public async open(): Promise<void> {
		this.logMessage('info', 'opening connection');
		this.status = ConnectionStatus.connecting;
		await this.getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.size > 0) {
			// prevent connection attempt if features are invalid
			this.logMessage('info', `invalid features found: ${this.serverFeatureSet.invalidFeatures}`);
			this.logMessage('error', 'connection will not be opened');
			this.status = ConnectionStatus.disconnected;
			throw new InvalidServerFeaturesError({
				invalidFeatures: Array.from(this.serverFeatureSet.invalidFeatures),
			});
		}

		await this.getDbServerInfo(); // establish baseline for database server information

		this.logMessage('info', 'connection opened');
		this.status = ConnectionStatus.connected;
	}

	/** Deploy database features */
	public async deployFeatures(
		sourceDir: string,
		options: DeployFeaturesOptions = {},
	): Promise<void> {
		const { createDir = false } = options;

		await this.getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.size === 0) {
			// there aren't any invalid features to deploy
			this.logMessage('debug', 'no missing features to deploy');
			return;
		}

		this.logMessage('info', `deploying features to directory ${sourceDir}`);

		if (createDir) {
			// create deployment directory (if necessary)
			this.logMessage('info', `creating deployment directory ${sourceDir}`);
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

				this.logMessage('info', `deploying the "${feature}" feature to ${sourceDir}`);
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
				this.logMessage('info', `deploying ${feature} to ${sourceDir}`);
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
		this.logMessage('debug', `executing database feature "${feature}"`);

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

		this.logMessage('debug', `executing database subroutine ${data.subroutineId}`);

		return this.executeDb(data);
	}

	/** Get the current ISOCalendarDate from the database */
	public async getDbDate(): Promise<string> {
		await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), this.timeDrift), ISOCalendarDateFormat);
	}

	/** Get the current ISOCalendarDateTime from the database */
	public async getDbDateTime(): Promise<string> {
		await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), this.timeDrift), ISOCalendarDateTimeFormat);
	}

	/** Get the current ISOTime from the database */
	public async getDbTime(): Promise<string> {
		await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), this.timeDrift), ISOTimeFormat);
	}

	/** Define a new model */
	public model<TSchema extends GenericObject>(
		schema: Schema | null,
		file: string,
	): ModelConstructor {
		if (this.status !== ConnectionStatus.connected) {
			this.logMessage(
				'error',
				'Cannot create model until database connection has been established',
			);
			throw new Error('Cannot create model until database connection has been established');
		}
		return compileModel<TSchema>(this, schema, file);
	}

	/** Log a message to logger including account name */
	public logMessage(level: keyof Logger, message: string): void {
		const formattedMessage = `[${this.account}] ${message}`;

		this.logger[level](formattedMessage);
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
		this.logMessage('debug', `executing database function with action "${data.action}"`);

		let response;
		try {
			response = await this.axiosInstance.post<DbFeatureResponseTypes | DbActionResponseError>('', {
				input: data,
			});
		} catch (err) {
			return axios.isAxiosError(err) ? this.handleAxiosError(err) : this.handleUnexpectedError(err);
		}

		this.handleDbServerError(response);

		// return the relevant portion from the db server response
		return response.data.output;
	}

	/** Get the db server information (date, time, etc.) */
	private async getDbServerInfo() {
		if (Date.now() > this.cacheExpiry) {
			this.logMessage('debug', 'getting db server information');
			const data = await this.executeDbFeature('getServerInfo', {});

			const { date, time } = data;

			this.timeDrift = differenceInMilliseconds(
				addMilliseconds(addDays(mvEpoch, date), time),
				Date.now(),
			);

			this.cacheExpiry = Date.now() + this.cacheMaxAge * 1000;
		}
	}

	/** Get the state of database server features */
	private async getFeatureState() {
		this.logMessage('debug', 'getting state of database server features');
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
	}

	/** Get a list of database server features */
	private async getServerFeatures(): Promise<Map<string, string[]>> {
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

			this.logMessage(
				'debug',
				`feature "${featureName}" version "${featureVersion}" found on database server`,
			);

			const versions = acc.get(featureName) ?? [];
			versions.push(featureVersion);

			acc.set(featureName, versions);
			return acc;
		}, new Map<string, string[]>());
	}

	/**
	 * Handle error from the database server
	 * @throws {@link ForeignKeyValidationError} A foreign key constraint was violated
	 * @throws {@link RecordLockedError} A record was locked and could not be updated
	 * @throws {@link RecordVersionError} A record changed between being read and written and could not be updated
	 * @throws {@link DbServerError} An error was encountered on the database server
	 */
	private handleDbServerError<TResponse extends DbFeatureResponseTypes>(
		response: AxiosResponse<TResponse | DbActionResponseError>,
	): asserts response is AxiosResponse<TResponse> {
		if (response.data.output == null) {
			// handle invalid response
			this.logMessage('error', 'Response from db server was malformed');
			throw new DbServerError({ message: 'Response from db server was malformed' });
		}

		if ('errorCode' in response.data.output) {
			const errorCode = Number(response.data.output.errorCode);
			switch (errorCode) {
				case dbErrors.foreignKeyValidation.code:
					this.logMessage('debug', 'foreign key violations found when saving record');
					throw new ForeignKeyValidationError({
						foreignKeyValidationErrors: (response.data.output as DbActionOutputErrorForeignKey)
							.foreignKeyValidationErrors,
					});
				case dbErrors.recordLocked.code:
					this.logMessage('debug', 'record locked when saving record');
					throw new RecordLockedError();
				case dbErrors.recordVersion.code:
					this.logMessage('debug', 'record version mismatch found when saving record');
					throw new RecordVersionError();
				default:
					this.logMessage(
						'error',
						`error code ${response.data.output.errorCode} occurred in database operation`,
					);
					throw new DbServerError({ errorCode: response.data.output.errorCode });
			}
		}
	}

	/** Handle an axios error */
	private handleAxiosError(err: AxiosError): never {
		if (err.code === 'ETIMEDOUT') {
			this.logMessage('error', `Timeout error occurred in MVIS request: ${err.message}`);
			throw new TimeoutError({ message: err.message });
		}

		this.logMessage('error', `Error occurred in MVIS request: ${err.message}`);
		throw new MvisError({
			message: err.message,
			mvisRequest: err.request,
			mvisResponse: err.response,
		});
	}

	/** Handle an unknown error */
	private handleUnexpectedError(err: unknown): never {
		if (err instanceof Error) {
			this.logMessage('error', `Error occurred in MVIS request: ${err.message}`);
			throw new UnknownError({ message: err.message });
		}

		this.logMessage('error', 'Unknown error occurred in MVIS request');
		throw new UnknownError();
	}
}

export default Connection;
