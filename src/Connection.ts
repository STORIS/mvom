import type http from 'http';
import type https from 'https';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { addDays, addMilliseconds, differenceInMilliseconds, format } from 'date-fns';
import semver from 'semver';
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
import { dependencies as serverDependencies } from './manifest.json';
import type Schema from './Schema';
import type {
	DbActionOutputErrorForeignKey,
	DbActionResponseError,
	DbServerDelimiters,
	DbServerLimits,
	DbSubroutineInputOptionsMap,
	DbSubroutinePayload,
	DbSubroutineResponseTypes,
	DbSubroutineResponseTypesMap,
	DbSubroutineSetupOptions,
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
	/** Optional http agent */
	httpAgent?: http.Agent;
	/** Optional https agent */
	httpsAgent?: https.Agent;
}

interface ConnectionConstructorOptions {
	/** Optional http agent */
	httpAgent?: http.Agent;
	/** Optional https agent */
	httpsAgent?: https.Agent;
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

/** Multivalue database server information */
interface ServerInfo {
	/** Time that the connection information cache will expire */
	cacheExpiry: number;
	/** +/- in milliseconds between database server time and local server time */
	timeDrift: number;
	/** Multivalue database server delimiters */
	delimiters: DbServerDelimiters;
	/** Multivalue database server limits */
	limits: DbServerLimits;
}
// #endregion

/** A connection object */
class Connection {
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

	/** Maximum age of the cache before it must be refreshed */
	private readonly cacheMaxAge: number;

	/** Multivalue database server information */
	private dbServerInfo?: ServerInfo;

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
		options: ConnectionConstructorOptions,
	) {
		const { httpAgent, httpsAgent } = options;

		this.account = account;
		this.logger = logger;
		this.cacheMaxAge = cacheMaxAge;

		const baseURL = new URL(
			`${account}/subroutine/${Connection.getServerProgramName('entry')}`,
			mvisUri,
		).toString();

		this.axiosInstance = axios.create({
			baseURL,
			timeout,
			transitional: { clarifyTimeoutError: true },
			...(httpAgent && { httpAgent }),
			...(httpsAgent && { httpsAgent }),
		});

		this.logMessage('debug', 'creating new connection instance');
	}

	/** Create a connection */
	public static createConnection(
		/** URI of the MVIS which facilitates access to the mv database */
		mvisUri: string,
		/** Database account that connection will be used against */
		account: string,
		options: CreateConnectionOptions = {},
	): Connection {
		const {
			logger = dummyLogger,
			cacheMaxAge = 3600,
			timeout = 0,
			httpAgent,
			httpsAgent,
		} = options;

		if (!Number.isInteger(cacheMaxAge)) {
			throw new InvalidParameterError({ parameterName: 'cacheMaxAge' });
		}

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		return new Connection(mvisUri, account, logger, cacheMaxAge, timeout, {
			httpAgent,
			httpsAgent,
		});
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

	/** Open a database connection */
	public async open(): Promise<void> {
		this.logMessage('info', 'opening connection');
		this.status = ConnectionStatus.connecting;
		// await this.getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.size > 0) {
			// prevent connection attempt if features are invalid
			this.logMessage('info', `invalid features found: ${this.serverFeatureSet.invalidFeatures}`);
			this.logMessage('error', 'connection will not be opened');
			this.status = ConnectionStatus.disconnected;
			throw new InvalidServerFeaturesError({
				invalidFeatures: Array.from(this.serverFeatureSet.invalidFeatures),
			});
		}

		this.status = ConnectionStatus.connected;

		await this.getDbServerInfo(); // establish baseline for database server information

		this.logMessage('info', 'connection opened');
	}

	/** Execute a database feature */
	public async executeDbFeature<
		TFeature extends keyof (DbSubroutineInputOptionsMap & DbSubroutineResponseTypesMap),
	>(
		feature: TFeature,
		options: DbSubroutineInputOptionsMap[TFeature],
		setupOptions: DbSubroutineSetupOptions = {},
		teardownOptions: Record<string, never> = {},
	): Promise<DbSubroutineResponseTypesMap[TFeature]['output']> {
		this.logMessage('debug', `executing database feature "${feature}"`);

		const featureVersion = this.serverFeatureSet.validFeatures.get(feature);

		const data: DbSubroutinePayload<DbSubroutineInputOptionsMap[TFeature]> = {
			// make sure to use the compatible server version of feature
			subroutineId: Connection.getServerProgramName(feature, featureVersion),
			subroutineInput: options,
			setupOptions,
			teardownOptions,
		};

		this.logMessage('debug', `executing database subroutine ${data.subroutineId}`);

		let response;
		try {
			response = await this.axiosInstance.post<DbSubroutineResponseTypes | DbActionResponseError>(
				'',
				{
					input: data,
				},
			);
		} catch (err) {
			return axios.isAxiosError(err) ? this.handleAxiosError(err) : this.handleUnexpectedError(err);
		}

		this.handleDbServerError(response);

		// return the relevant portion from the db server response
		return response.data.output;
	}

	/** Get the current ISOCalendarDate from the database */
	public async getDbDate(): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), timeDrift), ISOCalendarDateFormat);
	}

	/** Get the current ISOCalendarDateTime from the database */
	public async getDbDateTime(): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), timeDrift), ISOCalendarDateTimeFormat);
	}

	/** Get the current ISOTime from the database */
	public async getDbTime(): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo();
		return format(addMilliseconds(Date.now(), timeDrift), ISOTimeFormat);
	}

	/** Get the multivalue database server limits */
	public async getDbLimits(): Promise<DbServerLimits> {
		const { limits } = await this.getDbServerInfo();
		return limits;
	}

	/** Define a new model */
	public model<TSchema extends GenericObject>(
		schema: Schema | null,
		file: string,
	): ModelConstructor {
		if (this.status !== ConnectionStatus.connected || this.dbServerInfo == null) {
			this.logMessage(
				'error',
				'Cannot create model until database connection has been established',
			);
			throw new Error('Cannot create model until database connection has been established');
		}

		const { delimiters } = this.dbServerInfo;

		return compileModel<TSchema>(this, schema, file, delimiters);
	}

	/** Log a message to logger including account name */
	public logMessage(level: keyof Logger, message: string): void {
		const formattedMessage = `[${this.account}] ${message}`;

		this.logger[level](formattedMessage);
	}

	/** Get the db server information (date, time, etc.) */
	private async getDbServerInfo(): Promise<ServerInfo> {
		if (this.dbServerInfo == null || Date.now() > this.dbServerInfo.cacheExpiry) {
			if (this.status !== ConnectionStatus.connected) {
				this.logMessage(
					'error',
					'Cannot get database server info until database connection has been established',
				);
				throw new Error(
					'Cannot get database server info until database connection has been established',
				);
			}

			this.logMessage('debug', 'getting db server information');
			const { date, time, delimiters, limits } = await this.executeDbFeature('getServerInfo', {});

			const timeDrift = differenceInMilliseconds(
				addMilliseconds(addDays(mvEpoch, date), time),
				Date.now(),
			);
			const cacheExpiry = Date.now() + this.cacheMaxAge * 1000;

			this.dbServerInfo = {
				cacheExpiry,
				timeDrift,
				delimiters,
				limits,
			};
		}

		return this.dbServerInfo;
	}

	/**
	 * Handle error from the database server
	 * @throws {@link ForeignKeyValidationError} A foreign key constraint was violated
	 * @throws {@link RecordLockedError} A record was locked and could not be updated
	 * @throws {@link RecordVersionError} A record changed between being read and written and could not be updated
	 * @throws {@link DbServerError} An error was encountered on the database server
	 */
	private handleDbServerError<TResponse extends DbSubroutineResponseTypes>(
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
