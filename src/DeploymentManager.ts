import type http from 'http';
import type https from 'https';
import path from 'path';
import axios from 'axios';
import type { AxiosInstance, AxiosRequestHeaders, AxiosResponse } from 'axios';
import fs from 'fs-extra';
import { InvalidParameterError } from './errors';
import type LogHandler from './LogHandler';

// #region types
export interface CreateDeploymentManagerOptions {
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

export interface DeployOptions {
	/**
	 * Create directory when deploying
	 * @defaultValue false
	 */
	createDir?: boolean;
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

interface SubroutineParameterDetail {
	name: string;
	type: 'string' | 'json';
	order: number;
	dname: '';
}
interface SubroutineParameterDefinition {
	name: '';
	parameters: SubroutineParameterDetail[];
}

interface SubroutineCreate {
	name: string;
	parameter_count: number;
	input: SubroutineParameterDefinition;
	output: SubroutineParameterDefinition;
	allowCompileAndCatalog?: boolean;
	createSourceDir?: boolean;
	sourceDir?: string;
	catalogOptions?: string;
	compileOptions?: string;
	source?: string;
}
// #endregion

class DeploymentManager {
	/** File system path of the UniBasic source code */
	private static readonly unibasicPath = path.resolve(path.join(__dirname, 'unibasic'));

	/** MVIS subroutine name */
	public readonly subroutineName: string;

	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

	/** Database account name */
	private readonly account: string;

	/** Log handler instance used for diagnostic logging */
	private readonly logHandler: LogHandler;

	/** MVIS Admin authorization header */
	private readonly authorization: string;

	/** Main file source code name */
	private readonly mainFileName: string;

	private constructor(
		/** URL of the MVIS Admin */
		mvisAdminUrl: string,
		/** Database account that will be administered will be used against */
		account: string,
		/** MVIS Admin username */
		username: string,
		/** MVIS Admin password */
		password: string,
		/** Request timeout (ms) */
		timeout: number,
		/** Log handler instance */
		logHandler: LogHandler,
		options: DeploymentManagerConstructorOptions = {},
	) {
		const { httpAgent, httpsAgent } = options;

		this.account = account;
		this.logHandler = logHandler;
		this.authorization = Buffer.from(`${username}:${password}`).toString('base64');

		const url = new URL(mvisAdminUrl);
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
		/** URL of the MVIS Admin */
		mvisAdminUrl: string,
		/** Database account that will be administered will be used against */
		account: string,
		/** MVIS Admin username */
		username: string,
		/** MVIS Admin password */
		password: string,
		/** Log Handler */
		logHandler: LogHandler,
		options: CreateDeploymentManagerOptions = {},
	): DeploymentManager {
		const { timeout = 0, httpAgent, httpsAgent } = options;

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		return new DeploymentManager(mvisAdminUrl, account, username, password, timeout, logHandler, {
			httpAgent,
			httpsAgent,
		});
	}

	/** Validate that the MVOM main subroutine is available */
	public async validateDeployment(): Promise<boolean> {
		const headers = await this.authenticate();

		this.logHandler.debug('Fetching list of REST subroutines from MVIS Admin');
		const { data: response } = await this.axiosInstance.get<SubroutinesGetResult>(
			`manager/rest/${this.account}/subroutines`,
			{ headers },
		);

		const isValid = Object.values(response).some(
			(subroutine) => subroutine.name === this.subroutineName,
		);

		if (isValid) {
			this.logHandler.debug(`${this.subroutineName} is available for calling through MVIS`);
		} else {
			this.logHandler.warn(`${this.subroutineName} is unavailable for calling through MVIS`);
		}

		return isValid;
	}

	/** Deploy the MVOM main subroutine to MVIS */
	public async deploy(sourceDir: string, options: DeployOptions = {}): Promise<void> {
		const { createDir = false } = options;

		const isValid = await this.validateDeployment();
		if (isValid) {
			// if mvis is already configured for use with mvom, do not deploy
			return;
		}

		const headers = await this.authenticate();

		const sourcePath = path.join(DeploymentManager.unibasicPath, this.mainFileName);
		this.logHandler.debug(`Reading unibasic source from ${sourcePath}`);
		const source = await fs.readFile(sourcePath, 'utf8');

		this.logHandler.debug(
			`Creating REST subroutine definition for ${this.subroutineName} in MVIS Admin`,
		);
		await this.axiosInstance.post<unknown, AxiosResponse, SubroutineCreate>(
			`manager/rest/${this.account}/subroutine`,
			{
				name: this.subroutineName,
				parameter_count: 2,
				input: { name: '', parameters: [{ name: 'input', type: 'json', order: 1, dname: '' }] },
				output: { name: '', parameters: [{ name: 'output', type: 'json', order: 2, dname: '' }] },
				allowCompileAndCatalog: true,
				createSourceDir: createDir,
				sourceDir,
				catalogOptions: 'force',
				compileOptions: '-i -o -d',
				source,
			},
			{ headers },
		);
		this.logHandler.debug(`${this.subroutineName} successfully created in MVIS Admin`);

		this.logHandler.debug(`Compiling and cataloging ${this.subroutineName} on database server`);
		await this.axiosInstance.get(
			`manager/rest/${this.account}/loadsubroutine/${this.subroutineName}`,
			{ headers },
		);
		this.logHandler.debug(`Compiled ${this.subroutineName} on database server`);
	}

	/** Authenticate to MVIS admin and return headers needed for subsequent API calls */
	private async authenticate(): Promise<AuthenticateResult & AxiosRequestHeaders> {
		this.logHandler.debug('Authenticating to MVIS Admin');

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

		this.logHandler.debug('Successfully authenticated to MVIS admin');

		return {
			Cookie: cookies.join('; '),
			'X-XSRF-TOKEN': xsrfToken,
		};
	}
}

export default DeploymentManager;
