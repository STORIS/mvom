import crypto from 'crypto';
import type http from 'http';
import type https from 'https';
import { Mutex } from 'async-mutex';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { addDays, addMilliseconds, differenceInMilliseconds, format } from 'date-fns';
import compileModel, { type ModelConstructor } from './compileModel';
import {
	dbErrors,
	ISOCalendarDateFormat,
	ISOCalendarDateTimeFormat,
	ISOTimeFormat,
	mvEpoch,
} from './constants';
import type { DeployOptions } from './DeploymentManager';
import DeploymentManager from './DeploymentManager';
import {
	ConnectionError,
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
import type { Logger } from './LogHandler';
import LogHandler from './LogHandler';
import type Schema from './Schema';
import type { SchemaDefinition } from './Schema';
import type {
	DbServerDelimiters,
	DbServerLimits,
	DbSubroutineInputDeleteById,
	DbSubroutineInputOptionsMap,
	DbSubroutineInputSave,
	DbSubroutineOutputErrorForeignKey,
	DbSubroutinePayload,
	DbSubroutineResponseError,
	DbSubroutineResponseTypes,
	DbSubroutineResponseTypesMap,
	DbSubroutineSetupOptions,
} from './types';

// #region Types

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
	/** Maximum allowed return payload size in bytes */
	maxReturnPayloadSize?: number;
}

interface ConnectionConstructorOptions {
	/** Optional http agent */
	httpAgent?: http.Agent;
	/** Optional https agent */
	httpsAgent?: https.Agent;
	/** Maximum allowed return payload size in bytes */
	maxReturnPayloadSize: number;
}

export enum ConnectionStatus {
	disconnected = 'disconnected',
	connected = 'connected',
	connecting = 'connecting',
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

interface RequestOptions {
	requestId?: string;
}

export interface OpenOptions extends RequestOptions {
	/**
	 * Validate the multivalue subroutine deployment before opening the connection
	 * @defaultValue `true`
	 */
	validateDeployment?: boolean;
}

export type DbServerInfoOptions = RequestOptions;

export type GetDbDateOptions = RequestOptions;

export type GetDbDateTimeOptions = RequestOptions;

export type GetDbTimeOptions = RequestOptions;

export type GetDbLimitsOptions = RequestOptions;
// #endregion

/** A connection object */
class Connection {
	/** Connection status */
	public status: ConnectionStatus = ConnectionStatus.disconnected;

	/** Log handler instance used for diagnostic logging */
	private readonly logHandler: LogHandler;

	/** Maximum age of the cache before it must be refreshed */
	private readonly cacheMaxAge: number;

	/** Multivalue database server information */
	private dbServerInfo?: ServerInfo;

	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

	/** Deployment Manager instance */
	private readonly deploymentManager: DeploymentManager;

	/** Mutex on acquiring server information */
	private readonly serverInfoMutex: Mutex;

	/** Maximum allowed return payload size in bytes */
	private readonly maxReturnPayloadSize: number;

	private constructor(
		/** URL of the MVIS which facilitates access to the mv database */
		mvisUrl: string,
		/** Database account that connection will be used against */
		account: string,
		/** Lifetime of cache of db server data (s) */
		cacheMaxAge: number,
		/** Request timeout (ms) */
		timeout: number,
		logHandler: LogHandler,
		deploymentManager: DeploymentManager,
		options: ConnectionConstructorOptions,
	) {
		const { httpAgent, httpsAgent, maxReturnPayloadSize } = options;

		this.cacheMaxAge = cacheMaxAge;
		this.logHandler = logHandler;
		this.deploymentManager = deploymentManager;
		this.maxReturnPayloadSize = maxReturnPayloadSize;

		const url = new URL(mvisUrl);
		url.pathname = url.pathname.replace(/\/?$/, `/${account}/subroutine/`);
		const baseURL = url.toString();

		this.axiosInstance = axios.create({
			baseURL,
			timeout,
			transitional: { clarifyTimeoutError: true },
			...(httpAgent && { httpAgent }),
			...(httpsAgent && { httpsAgent }),
		});

		this.serverInfoMutex = new Mutex();

		this.logHandler.debug('creating new connection instance');
	}

	/** Returns the subroutine name that is used on the multivalue server */
	public get subroutineName(): string {
		return this.deploymentManager.subroutineName;
	}

	/** Create a connection */
	public static createConnection(
		/** URL of the MVIS which facilitates access to the mv database */
		mvisUrl: string,
		/** URL of the MVIS Admin */
		mvisAdminUrl: string,
		/** MVIS Admin Username */
		mvisAdminUsername: string,
		/** MVIS Admin Password */
		mvisAdminPassword: string,
		/** Database account that connection will be used against */
		account: string,
		options: CreateConnectionOptions = {},
	): Connection {
		const {
			logger,
			cacheMaxAge = 3600,
			timeout = 0,
			httpAgent,
			httpsAgent,
			maxReturnPayloadSize = 100_000_000,
		} = options;

		if (!Number.isInteger(cacheMaxAge)) {
			throw new InvalidParameterError({ parameterName: 'cacheMaxAge' });
		}

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		if (maxReturnPayloadSize < 0) {
			throw new InvalidParameterError({ parameterName: 'maxReturnPayloadSize' });
		}

		const logHandler = new LogHandler(account, logger);

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			mvisAdminUsername,
			mvisAdminPassword,
			logHandler,
			{ timeout, httpAgent, httpsAgent },
		);

		return new Connection(mvisUrl, account, cacheMaxAge, timeout, logHandler, deploymentManager, {
			httpAgent,
			httpsAgent,
			maxReturnPayloadSize,
		});
	}

	/** Open a database connection */
	public async open(options: OpenOptions = {}): Promise<void> {
		const { requestId, validateDeployment = true } = options;

		if (this.status !== ConnectionStatus.disconnected) {
			this.logHandler.error('Connection is not closed');
			throw new ConnectionError({ message: 'Connection is not closed' });
		}

		this.logHandler.info('opening connection');
		this.status = ConnectionStatus.connecting;

		if (validateDeployment) {
			this.logHandler.info('Validating deployment');
			await this.validateDeployment();
		} else {
			this.logHandler.info('Skipping deployment validation');
		}

		this.status = ConnectionStatus.connected;

		await this.getDbServerInfo({ requestId }); // establish baseline for database server information

		this.logHandler.info('connection opened');
	}

	/** Deploy source code to MVIS & db server */
	public async deploy(sourceDir: string, options?: DeployOptions): Promise<void> {
		return this.deploymentManager.deploy(sourceDir, options);
	}

	/** Execute a database subroutine */
	public async executeDbSubroutine<
		TSubroutineName extends keyof (DbSubroutineInputOptionsMap & DbSubroutineResponseTypesMap),
	>(
		subroutineName: TSubroutineName,
		options: DbSubroutineInputOptionsMap[TSubroutineName],
		setupOptions: DbSubroutineSetupOptions = {},
		teardownOptions: Record<string, never> = {},
	): Promise<DbSubroutineResponseTypesMap[TSubroutineName]['output']> {
		if (this.status !== ConnectionStatus.connected) {
			this.logHandler.error(
				'Cannot execute database features until database connection has been established',
			);
			throw new Error(
				'Cannot execute database features until database connection has been established',
			);
		}
		const { maxReturnPayloadSize = this.maxReturnPayloadSize, requestId = crypto.randomUUID() } =
			setupOptions;
		if (maxReturnPayloadSize < 0) {
			this.logHandler.error(
				`Maximum returned payload size of ${maxReturnPayloadSize} is invalid. Must be a positive integer`,
			);
			throw new Error(
				`Maximum returned payload size of ${maxReturnPayloadSize} is invalid. Must be a positive integer`,
			);
		}

		const updatedSetupOptions = { ...setupOptions, maxReturnPayloadSize, requestId };

		this.logHandler.debug(`executing database subroutine "${subroutineName}"`);

		const data: DbSubroutinePayload<DbSubroutineInputOptionsMap[TSubroutineName]> = {
			subroutineId: subroutineName,
			subroutineInput: options,
			setupOptions: updatedSetupOptions,
			teardownOptions,
		};

		let response;
		try {
			response = await this.axiosInstance.post<
				DbSubroutineResponseTypes | DbSubroutineResponseError
			>(this.subroutineName, { input: data }, { headers: { 'X-MVIS-Trace-Id': requestId } });
		} catch (err) {
			return axios.isAxiosError(err) ? this.handleAxiosError(err) : this.handleUnexpectedError(err);
		}

		this.handleDbServerError(response, subroutineName, options, updatedSetupOptions);

		// return the relevant portion from the db server response
		return response.data.output;
	}

	/** Get the current ISOCalendarDate from the database */
	public async getDbDate({ requestId }: GetDbDateOptions = {}): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo({ requestId });
		return format(addMilliseconds(Date.now(), timeDrift), ISOCalendarDateFormat);
	}

	/** Get the current ISOCalendarDateTime from the database */
	public async getDbDateTime({ requestId }: GetDbDateTimeOptions = {}): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo({ requestId });
		return format(addMilliseconds(Date.now(), timeDrift), ISOCalendarDateTimeFormat);
	}

	/** Get the current ISOTime from the database */
	public async getDbTime({ requestId }: GetDbTimeOptions = {}): Promise<string> {
		const { timeDrift } = await this.getDbServerInfo({ requestId });
		return format(addMilliseconds(Date.now(), timeDrift), ISOTimeFormat);
	}

	/** Get the multivalue database server limits */
	public async getDbLimits({ requestId }: GetDbLimitsOptions = {}): Promise<DbServerLimits> {
		const { limits } = await this.getDbServerInfo({ requestId });
		return limits;
	}

	/** Define a new model */
	public model<
		TSchema extends Schema<TSchemaDefinition> | null,
		TSchemaDefinition extends SchemaDefinition,
	>(schema: TSchema, file: string): ModelConstructor<TSchema, TSchemaDefinition> {
		if (this.status !== ConnectionStatus.connected || this.dbServerInfo == null) {
			this.logHandler.error('Cannot create model until database connection has been established');
			throw new Error('Cannot create model until database connection has been established');
		}

		const { delimiters } = this.dbServerInfo;

		return compileModel(this, schema, file, delimiters, this.logHandler);
	}

	/** Validate the multivalue subroutine deployment */
	private async validateDeployment(): Promise<void> {
		const isValid = await this.deploymentManager.validateDeployment();
		if (!isValid) {
			// prevent connection attempt if features are invalid
			this.logHandler.info('MVIS has not been configured for use with MVOM');
			this.logHandler.error('Connection will not be opened');
			this.status = ConnectionStatus.disconnected;
			throw new InvalidServerFeaturesError();
		}
	}

	/** Get the db server information (date, time, etc.) */
	private async getDbServerInfo({ requestId }: DbServerInfoOptions = {}): Promise<ServerInfo> {
		// set a mutex on acquiring server information so multiple simultaneous requests are not modifying the cache
		return this.serverInfoMutex.runExclusive(async () => {
			if (this.dbServerInfo == null || Date.now() > this.dbServerInfo.cacheExpiry) {
				this.logHandler.debug('getting db server information');
				const { date, time, delimiters, limits } = await this.executeDbSubroutine(
					'getServerInfo',
					{},
					{ ...(requestId != null && { requestId }) },
				);

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
		});
	}

	/**
	 * Handle error from the database server
	 * @throws {@link ForeignKeyValidationError} A foreign key constraint was violated
	 * @throws {@link RecordLockedError} A record was locked and could not be updated
	 * @throws {@link RecordVersionError} A record changed between being read and written and could not be updated
	 * @throws {@link DbServerError} An error was encountered on the database server
	 */
	private handleDbServerError<
		TResponse extends DbSubroutineResponseTypes,
		TSubroutineName extends keyof (DbSubroutineInputOptionsMap & DbSubroutineResponseTypesMap),
	>(
		response: AxiosResponse<TResponse | DbSubroutineResponseError>,
		subroutineName: TSubroutineName,
		options: DbSubroutineInputOptionsMap[TSubroutineName],
		setupOptions: DbSubroutineSetupOptions,
	): asserts response is AxiosResponse<TResponse> {
		if (response.data.output == null) {
			// handle invalid response
			this.logHandler.error(`Response from db server was malformed when calling ${subroutineName}`);
			throw new DbServerError({
				message: `Response from db server was malformed when calling ${subroutineName}`,
			});
		}

		if ('errorCode' in response.data.output) {
			const errorCode = Number(response.data.output.errorCode);
			switch (errorCode) {
				case dbErrors.foreignKeyValidation.code: {
					const { filename, id } = options as DbSubroutineInputSave;
					this.logHandler.debug(
						`foreign key violations found when saving record ${id} to ${filename}`,
					);
					throw new ForeignKeyValidationError({
						foreignKeyValidationErrors: (response.data.output as DbSubroutineOutputErrorForeignKey)
							.foreignKeyValidationErrors,
						filename,
						recordId: id,
					});
				}
				case dbErrors.recordLocked.code: {
					const { filename, id } = options as DbSubroutineInputSave | DbSubroutineInputDeleteById;
					if (subroutineName === 'deleteById') {
						this.logHandler.debug(`record locked when deleting record ${id} from ${filename}`);
					} else {
						this.logHandler.debug(`record locked when saving record ${id} to ${filename}`);
					}
					throw new RecordLockedError({ filename, recordId: id });
				}
				case dbErrors.recordVersion.code: {
					const { filename, id } = options as DbSubroutineInputSave;
					this.logHandler.debug(
						`record version mismatch found when saving record ${id} to ${filename}`,
					);
					throw new RecordVersionError({ filename, recordId: id });
				}
				case dbErrors.maxPayloadExceeded.code: {
					const { maxReturnPayloadSize } = setupOptions;
					this.logHandler.debug(
						`Maximum return payload size of ${maxReturnPayloadSize} bytes exceeded`,
					);
					throw new DbServerError({
						message: `Maximum return payload size of ${maxReturnPayloadSize} exceeded`,
					});
				}
				default:
					this.logHandler.error(
						`error code ${response.data.output.errorCode} occurred in database operation when calling ${subroutineName}`,
					);
					throw new DbServerError({ errorCode: response.data.output.errorCode });
			}
		}
	}

	/** Handle an axios error */
	private handleAxiosError(err: AxiosError): never {
		if (err.code === 'ETIMEDOUT') {
			this.logHandler.error(`Timeout error occurred in MVIS request: ${err.message}`);
			throw new TimeoutError({ message: err.message });
		}

		this.logHandler.error(`Error occurred in MVIS request: ${err.message}`);
		throw new MvisError({
			message: err.message,
			mvisRequest: err.request,
			mvisResponse: err.response,
		});
	}

	/** Handle an unknown error */
	private handleUnexpectedError(err: unknown): never {
		if (err instanceof Error) {
			this.logHandler.error(`Error occurred in MVIS request: ${err.message}`);
			throw new UnknownError({ message: err.message });
		}

		this.logHandler.error('Unknown error occurred in MVIS request');
		throw new UnknownError();
	}
}

export default Connection;
