import type http from 'http';
import type https from 'https';
import path from 'path';
import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestHeaders, AxiosResponse } from 'axios';
import fs from 'fs-extra';
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

interface AuthenticateResult {
	Cookie: string;
	'X-XSRF-TOKEN': string;
}

interface SubroutinesGetValue {
	[key: string]: unknown;
	/** Subroutine definition name */
	name: string;
}
type SubroutinesGetResult = Record<string, SubroutinesGetValue>;
// #endregion

class DeploymentManager {
	/** File system path of the UniBasic source code */
	private static readonly unibasicPath = path.resolve(path.join(__dirname, 'unibasic'));

	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

	/** Database account name */
	private readonly account: string;

	/** Logger instance used for diagnostic logging */
	private readonly logger: Logger;

	/** MVIS Admin authorization header */
	private readonly authorization: string;

	/** Main file source code name */
	private readonly mainFileName: string;

	/** MVIS subroutine name */
	private readonly subroutineName: string;

	private constructor(
		/** URI of the MVIS Admin */
		mvisAdminUri: string,
		/** Database account that will be administered will be used against */
		account: string,
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

		this.account = account;
		this.logger = logger;
		this.authorization = Buffer.from(`${username}:${password}`).toString('base64');

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

		const mainFileName = fs
			.readdirSync(DeploymentManager.unibasicPath)
			.find((filename) => /^mvom_main@[a-f0-9]{8}\.mvb$/.test(filename)); // e.g. mvom_main@abcdef12.mvb
		if (mainFileName == null) {
			throw new Error('DB Server source code repository is corrupted');
		}
		this.mainFileName = mainFileName;

		const [subroutineName] = mainFileName.split('.');
		this.subroutineName = subroutineName;
	}

	/** Create a deployment manager */
	public static createDeploymentManager(
		/** URI of the MVIS Admin */
		mvisAdminUri: string,
		/** Database account that will be administered will be used against */
		account: string,
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

		return new DeploymentManager(mvisAdminUri, account, username, password, timeout, logger, {
			httpAgent,
			httpsAgent,
		});
	}

	/** Validate that the MVOM main subroutine is available */
	public async validateDeployment(): Promise<boolean> {
		const headers = await this.authenticate();

		const { data: response } = await axios.get<SubroutinesGetResult>(
			`manager/rest/${this.account}/subroutines`,
			{ headers },
		);

		const isValid = Object.values(response).some(
			(subroutine) => subroutine.name === this.subroutineName,
		);

		if (isValid) {
			this.logger.debug(`${this.subroutineName} is available for calling through MVIS`);
		} else {
			this.logger.warn(`${this.subroutineName} is unavailable for calling through MVIS`);
		}

		return isValid;
	}

	/** Authenticate to MVIS admin and return headers needed for subsequent API calls */
	private async authenticate(): Promise<AuthenticateResult & AxiosRequestHeaders> {
		this.logger.debug('Authenticating to MVIS Admin');

		const authResponse = await this.axiosInstance.get('user', {
			headers: { authorization: `Basic ${this.authorization}` },
		});

		const cookies = authResponse.headers['set-cookie'];
		if (cookies == null) {
			throw new Error(
				'Unable to authenticate with MVIS Admin. No session id and xsrf token cookies returned.',
			);
		}

		const xsrfTokenCookie = cookies.find((cookie: string) => cookie.startsWith('XSRF-TOKEN='));
		if (xsrfTokenCookie == null) {
			throw new Error('Unable to authenticate with MVIS Admin. No xsrf token returned.');
		}

		// ex: XSRF-TOKEN=3c2a0741-f1a5-4d52-9145-b508e4fbc845; Path=/
		const xsrfToken = xsrfTokenCookie.split('=')[1].split(';')[0];

		this.logger.debug('Successfully authenticated to MVIS admin');

		return {
			Cookie: cookies.join('; '),
			'X-XSRF-TOKEN': xsrfToken,
		};
	}
}

export default DeploymentManager;
