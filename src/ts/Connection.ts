/* eslint-disable */
// TODO REMOVE THE ABOVE
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
	DbActionInputSubroutine,
	DbActionInputTypes,
	DbActionResponseCreateDir,
	DbActionResponseDeploy,
	DbFeatureResponseTypes,
	Logger,
} from '#shared/types';
import { dependencies as serverDependencies } from '../.mvomrc.json';
import compileModel from './compileModel';
import type Schema from './Schema';

export enum ConnectionStatus {
	// convert to enum when transitioning class to TS
	disconnected = 'disconnected',
	connected = 'connected',
	connecting = 'connecting',
}

export interface ConnectionConstructorOptions {
	connectionManagerUri: string;
	account: string;
	logger: Logger;
	cacheMaxAge: number;
	timeout: number;
}

export interface DeployFeaturesOptions {
	/**
	 * Create directory when deploying features
	 * @defaultValue false
	 */
	createDir?: boolean;
}

type ServerDependencies = keyof typeof serverDependencies;

/** A connection object */
class Connection {
	/** File system path of the UniBasic source code */
	private static unibasicPath = path.resolve(path.join(__dirname, '../', 'unibasic'));

	/** Connection status */
	public status: ConnectionStatus = ConnectionStatus.disconnected;

	/** Logger instance used for diagnostic logging */
	public logger: Logger;

	/** Object providing the current state of db server features and availability */
	private serverFeatureSet: {
		validFeatures: Partial<Record<ServerDependencies, string>>;
		invalidFeatures: ServerDependencies[];
	} = {
		validFeatures: {},
		invalidFeatures: [],
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

	public constructor(options: ConnectionConstructorOptions) {
		const { connectionManagerUri, account, logger, cacheMaxAge, timeout } = options;

		this.logger = logger;
		this.cacheMaxAge = cacheMaxAge;
		this.endpoint = `${connectionManagerUri}/${account}/subroutine/${Connection.getServerProgramName(
			'entry',
		)}`;
		this.timeout = timeout;

		logger.debug(`creating new connection instance`);
	}

	/** Return the packaged specific version number of a feature */
	private static getFeatureVersion(feature: ServerDependencies): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [featureVersion] = serverDependencies[feature].match(/\d\.\d\.\d.*$/)!;
		return featureVersion;
	}

	/** Get the exact name of a program on the database server */
	private static getServerProgramName(feature: ServerDependencies, version?: string): string {
		const featureVersion = version ?? Connection.getFeatureVersion(feature);
		return `mvom_${feature}@${featureVersion}`;
	}

	/** Get the UniBasic source code for a given feature */
	private static async getUnibasicSource(feature: ServerDependencies): Promise<string> {
		const filePath = path.join(Connection.unibasicPath, `${feature}.mvb`);
		return fs.readFile(filePath, 'utf8');
	}

	/**
	 * Handle error from the database server
	 * @throws {@link RecordLockedError} A record was locked and could not be updated
	 * @throws {@link RecordVersionError} A record changed between being read and written and could not be updated
	 * @throws {@link DbServerError} An error was encountered on the database server
	 */
	private static handleDbServerError(response: AxiosResponse) {
		if (response.data.output == null) {
			// handle invalid response
			throw new DbServerError({ message: 'Response from db server was malformed' });
		}

		const errorCode = +response.data.output.errorCode;

		if (errorCode) {
			switch (errorCode) {
				case dbErrors.foreignKeyValidation.code:
					throw new ForeignKeyValidationError({
						foreignKeyValidationErrors: response.data.output.foreignKeyValidationErrors,
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

		if (this.serverFeatureSet.invalidFeatures.length > 0) {
			// prevent connection attempt if features are invalid
			this.logger.verbose(`invalid features found: ${this.serverFeatureSet.invalidFeatures}`);
			this.logger.debug('connection will not be opened');
			this.status = ConnectionStatus.disconnected;
			throw new InvalidServerFeaturesError({
				invalidFeatures: this.serverFeatureSet.invalidFeatures,
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
		if (sourceDir == null) {
			throw new InvalidParameterError({ parameterName: 'sourceDir' });
		}

		if (this.serverFeatureSet.invalidFeatures.length <= 0) {
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
			await this.executeDb<DbActionInputCreateDir, DbActionResponseCreateDir>(data);
		}

		const bootstrapFeatures: ServerDependencies[] = ['deploy', 'setup', 'teardown'];
		const bootstrapped = await Promise.all(
			bootstrapFeatures.map(async (feature) => {
				if (!Object.prototype.hasOwnProperty.call(this.serverFeatureSet.validFeatures, feature)) {
					this.logger.debug(`deploying the "${feature}" feature to ${sourceDir}`);
					const data: DbActionInputDeploy = {
						action: 'deploy',
						sourceDir,
						source: await Connection.getUnibasicSource(feature),
						programName: Connection.getServerProgramName(feature),
					};

					await this.executeDb<DbActionInputDeploy, DbActionResponseDeploy>(data);
					return true;
				}
				return false;
			}),
		);

		if (bootstrapped.includes(true)) {
			// Bootstrap features needed for the deployment feature were installed, restart the deployment process
			await this.deployFeatures(sourceDir);
			return;
		}

		// deploy any other missing features
		await Promise.all(
			this.serverFeatureSet.invalidFeatures.map(async (feature) => {
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

	/**
	 * Execute a database feature
	 * @function executeDbFeature
	 * @memberof Connection
	 * @instance
	 * @async
	 * @param {string} feature - Name of feature to execute
	 * @param {*} [options={}] - Options parameter to pass to database feature
	 * @param {*} [setupOptions={}] - Options parameter to pass to setup feature
	 * @param {*} [teardownOptions={}] - Options parameter to pass to teardown feature
	 * @returns {*} Output from database feature
	 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
	 * @throws {DbServerError} (indirect) An error occurred on the database server
	 */
	public async executeDbFeature<TOptions extends Record<string, any>, TResult>(
		feature: ServerDependencies,
		options: TOptions,
		setupOptions: Record<string, any> = {},
		teardownOptions = {},
	) {
		this.logger.debug(`executing database feature "${feature}"`);
		const data: DbActionInputSubroutine<TOptions> = {
			action: 'subroutine',
			// make sure to use the compatible server version of feature
			subroutineId: Connection.getServerProgramName(
				feature,
				this.serverFeatureSet.validFeatures[feature],
			),
			setupId: Connection.getServerProgramName('setup', this.serverFeatureSet.validFeatures.setup),
			teardownId: Connection.getServerProgramName(
				'teardown',
				this.serverFeatureSet.validFeatures.teardown,
			),
			options,
			setupOptions,
			teardownOptions,
		};

		this.logger.debug(`executing database subroutine ${data.subroutineId}`);

		return this.executeDb<DbActionInputSubroutine<TOptions>, TResult>(data);
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
	public model(schema: Schema | null, file: string): ReturnType<typeof compileModel> {
		if (this.status !== ConnectionStatus.connected) {
			throw new Error('Cannot create model until database connection has been established.');
		}
		return compileModel(this, schema, file);
	}

	/* private instance methods */
	/**
	 * Execute a database function remotely
	 * @function _executeDb
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @param {Object} data
	 * @param {string} data.action - Remote action to invoke
	 * @param {*} data.xxx - Additional properties as required by remote function
	 * @returns {*} Output from database function execution
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 * @throws {ConnectionManagerError} An error occurred in connection manager communications
	 * @throws {DbServerError} An error occurred on the database server
	 */
	private async executeDb<
		TInput extends DbActionInputTypes,
		TResponse extends DbFeatureResponseTypes,
	>(data: TInput) {
		this.logger.debug(`executing database function with action "${data.action}"`);

		let response;
		try {
			response = await axios.post<TResponse>(
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

	/**
	 * Get the db server information (date, time, etc.)
	 * @function _getDbServerInfo
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @modifies {this}
	 */
	private async getDbServerInfo() {
		if (Date.now() > this.cacheExpiry) {
			this.logger.debug('getting db server information');
			const data = await this.executeDbFeature('getServerInfo');

			const { date, time } = data;

			this.timeDrift = moment(mvEpoch).add(date, 'days').add(time, 'ms').diff(moment());

			this.cacheExpiry = Date.now() + this.cacheMaxAge * 1000;
		}
	}

	/**
	 * Get the state of database server features
	 * @function _getFeatureState
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 */
	private getFeatureState = async () => {
		this.logger.debug(`getting state of database server features`);
		const serverFeatures = await this.getServerFeatures();

		this.serverFeatureSet = Object.entries(serverDependencies).reduce(
			(acc, [dependencyName, dependencyVersion]) => {
				if (!Object.prototype.hasOwnProperty.call(serverFeatures, dependencyName)) {
					// if the feature doesn't exist on the server then it is invalid
					acc.invalidFeatures.push(dependencyName);
					return acc;
				}

				const matchedVersion = semver.maxSatisfying(
					serverFeatures[dependencyName],
					dependencyVersion,
				);
				if (matchedVersion == null) {
					// no versions satisfy the requirement
					acc.invalidFeatures.push(dependencyName);
					return acc;
				}

				// return the match as a valid feature
				acc.validFeatures[dependencyName] = matchedVersion;
				return acc;
			},
			{
				validFeatures: {},
				invalidFeatures: [],
			},
		);
	};

	/**
	 * Get a list of database server features
	 * @function _getServerFeatures
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @returns {Object} Key(s): Feature(s) / Value(s): array(s) of versions
	 */
	private getServerFeatures = async (): Promise<Partial<Record<ServerDependencies, string>>> => {
		this.logger.debug(`getting list of features from database server`);
		const data = { action: 'featureList' };
		const response = await this.executeDb(data);

		if (!Array.isArray(response.features)) {
			this.logger.debug(`no features found on server`);
			return {};
		}

		return response.features.reduce((acc, feature) => {
			// only include programs in the format of mvom_feature@x.y.z
			const featureRegExp = /^mvom_(.*)@(\d\.\d\.\d.*$)/;

			const match = featureRegExp.exec(feature);
			if (!match) {
				// does not match the format of an mvom feature program
				return acc;
			}

			const featureName = match[1]; // acquired from first capturing group
			const featureVersion = match[2]; // acquired from second capturing group

			if (!semver.valid(featureVersion)) {
				// a valid feature will contain an @-version specification that uses semver
				return acc;
			}

			this.logger.debug(
				`feature "${featureName}" version "${featureVersion}" found on database server`,
			);
			if (Object.prototype.hasOwnProperty.call(acc, featureName)) {
				// another version of this feature already present - add to list of feature's versions
				acc[featureName].push(featureVersion);
				return acc;
			}

			// add this feature to the returned set
			return {
				...acc,
				[featureName]: [featureVersion],
			};
		}, {});
	};
}

export default Connection;
