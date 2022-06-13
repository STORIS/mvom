import type http from 'http';
import type https from 'https';
import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

interface DeploymentManagerConstructorOptions {
	/** Optional http agent */
	httpAgent?: http.Agent;
	/** Optional https agent */
	httpsAgent?: https.Agent;
}

class DeploymentManager {
	/** Axios instance */
	private readonly axiosInstance: AxiosInstance;

	private constructor(
		mvisAdminUri: string,
		username: string,
		password: string,
		options: DeploymentManagerConstructorOptions = {},
	) {
		const { httpAgent, httpsAgent } = options;

		this.axiosInstance = axios.create({
			baseURL,
			timeout,
			transitional: { clarifyTimeoutError: true },
			...(httpAgent && { httpAgent }),
			...(httpsAgent && { httpsAgent }),
		});
	}
}

export default DeploymentManager;
