import type http from 'http';
import type https from 'https';
import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { InvalidParameterError } from './errors';
import type { Logger } from './types';
import { dummyLogger } from './utils';

// #region types
export interface CreateDeploymentManagerOptions {
	/** Optional logger instance */
	logger?: Logger;
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

interface DeploymentManagerConstructorOptions {
	/** Optional http agent */
	httpAgent?: http.Agent;
	/** Optional https agent */
	httpsAgent?: https.Agent;
}
// #endregion

class DeploymentManager {
	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

	/** Logger instance used for diagnostic logging */
	private readonly logger: Logger;

	private constructor(
		/** URI of the MVIS Admin */
		mvisAdminUri: string,
		/** MVIS Admin username */
		username: string,
		/** MVIS Admin password */
		password: string,
		/** Request timeout (ms) */
		timeout: number,
		/** Logger instance */
		logger: Logger,
		options: DeploymentManagerConstructorOptions = {},
	) {
		const { httpAgent, httpsAgent } = options;

		this.logger = logger;

		const url = new URL(mvisAdminUri);
		url.pathname = url.pathname.replace(/\/?$/, `/api/`);
		const baseURL = url.toString();

		this.axiosInstance = axios.create({
			baseURL,
			timeout,
			transitional: { clarifyTimeoutError: true },
			...(httpAgent && { httpAgent }),
			...(httpsAgent && { httpsAgent }),
		});
	}

	/** Create a deployment manager */
	public static createDeploymentManager(
		/** URI of the MVIS Admin */
		mvisAdminUri: string,
		/** MVIS Admin username */
		username: string,
		/** MVIS Admin password */
		password: string,
		options: CreateDeploymentManagerOptions = {},
	): DeploymentManager {
		const { logger = dummyLogger, timeout = 0, httpAgent, httpsAgent } = options;

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		return new DeploymentManager(mvisAdminUri, username, password, timeout, logger, {
			httpAgent,
			httpsAgent,
		});
	}
}

export default DeploymentManager;
