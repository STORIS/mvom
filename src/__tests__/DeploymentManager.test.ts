import type http from 'http';
import type https from 'https';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import fs from 'fs-extra';
import { mock } from 'jest-mock-extended';
import { when } from 'jest-when';
import type { CreateDeploymentManagerOptions } from '../DeploymentManager';
import DeploymentManager from '../DeploymentManager';
import { InvalidParameterError } from '../errors';
import type LogHandler from '../LogHandler';

jest.mock('axios');
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;
const subroutineName = 'mvom_main@01234567';
const mvomFileName = `${subroutineName}.mvb`;

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosInstance = mock<AxiosInstance>();

const logHandler = mock<LogHandler>();

const mvisAdminUrl = 'http://foo.bar.com/mvisAdmin';
const username = 'username';
const password = 'password';
const account = 'account';

const expectedAuthorization = Buffer.from(`${username}:${password}`).toString('base64');
const expectedXsrfToken = '3c2a0741-f1a5-4d52-9145-b508e4fbc845';
const expectedCookie = `XSRF-TOKEN=${expectedXsrfToken}; Path=/`;

beforeEach(() => {
	// @ts-ignore: mock not respecting overload
	mockedFs.readdirSync.mockReturnValue([mvomFileName]);

	mockedAxios.create.mockReturnValue(mockedAxiosInstance);
});

describe('createDeploymentManager', () => {
	test('should throw InvalidParameterError if timeout is not an integer', () => {
		const options: CreateDeploymentManagerOptions = {
			timeout: 1.23,
		};

		expect(() => {
			DeploymentManager.createDeploymentManager(
				mvisAdminUrl,
				account,
				username,
				password,
				logHandler,
				options,
			);
		}).toThrow(InvalidParameterError);
	});

	test('should throw error if mvom main subroutine is not found', () => {
		// @ts-ignore: mock not respecting overload
		mockedFs.readdirSync.mockReturnValue(['unexpected_file_name']);

		expect(() => {
			DeploymentManager.createDeploymentManager(
				mvisAdminUrl,
				account,
				username,
				password,
				logHandler,
			);
		}).toThrow();
	});

	test('should return new DeploymentManager instance', () => {
		expect(
			DeploymentManager.createDeploymentManager(
				mvisAdminUrl,
				account,
				username,
				password,
				logHandler,
			),
		).toBeInstanceOf(DeploymentManager);
	});

	test('should allow for override of timeout', () => {
		const timeout = 1;

		DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
			{ timeout },
		);

		expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({ timeout }));
	});

	test('should allow for override of httpAgent', () => {
		const httpAgentMock = mock<http.Agent>();

		DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
			{ httpAgent: httpAgentMock },
		);

		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpAgent: httpAgentMock }),
		);
	});

	test('should allow for override of httpsAgent', () => {
		const httpsAgentMock = mock<https.Agent>();

		DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
			{ httpsAgent: httpsAgentMock },
		);

		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpsAgent: httpsAgentMock }),
		);
	});
});

describe('validateDeployment', () => {
	test('should reject if authentication does not return cookies', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({ data: {}, headers: {} });

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		await expect(deploymentManager.validateDeployment()).rejects.toThrow(Error);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(1);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
	});

	test('should reject if authentication does not return an XSRF-TOKEN cookie', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({ data: {}, headers: { 'set-cookie': ['not-xsrf-token'] } });

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		await expect(deploymentManager.validateDeployment()).rejects.toThrow(Error);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(1);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
	});

	test('should return false if mvom main subroutine does not have a definition', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({
				data: {},
				headers: { 'set-cookie': ['XSRF-TOKEN=3c2a0741-f1a5-4d52-9145-b508e4fbc845; Path=/'] },
			})
			.calledWith(`manager/rest/${account}/subroutines`, expect.anything())
			.mockResolvedValue({ data: {} });

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		expect(await deploymentManager.validateDeployment()).toBe(false);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(2);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(`manager/rest/${account}/subroutines`, {
			headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken },
		});
	});

	test('should return true if mvom main subroutine has a definition', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({
				data: {},
				headers: { 'set-cookie': [expectedCookie] },
			})
			.calledWith(`manager/rest/${account}/subroutines`, expect.anything())
			.mockResolvedValue({ data: { subroutineName: { name: subroutineName } } });

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		expect(await deploymentManager.validateDeployment()).toBe(true);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(2);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(`manager/rest/${account}/subroutines`, {
			headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken },
		});
	});
});

describe('deploy', () => {
	test('should not deploy if REST subroutine definition is already present', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({
				data: {},
				headers: { 'set-cookie': [expectedCookie] },
			})
			.calledWith(`manager/rest/${account}/subroutines`, expect.anything())
			.mockResolvedValue({ data: { subroutineName: { name: subroutineName } } });

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		const sourceDir = 'source_directory';

		await deploymentManager.deploy(sourceDir);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(2);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(`manager/rest/${account}/subroutines`, {
			headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken },
		});
	});

	test('should deploy REST subroutine definition and compile/catalog subroutine', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({
				data: {},
				headers: { 'set-cookie': [expectedCookie] },
			})
			.calledWith(`manager/rest/${account}/subroutines`, expect.anything())
			.mockResolvedValue({ data: {} });

		const source = 'source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		const sourceDir = 'source_directory';

		await deploymentManager.deploy(sourceDir);
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(4);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(`manager/rest/${account}/subroutines`, {
			headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			`manager/rest/${account}/loadsubroutine/${subroutineName}`,
			{ headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken } },
		);

		expect(mockedAxiosInstance.post).toHaveBeenCalledTimes(1);
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			`manager/rest/${account}/subroutine`,
			{
				name: subroutineName,
				parameter_count: 2,
				input: { name: '', parameters: [{ name: 'input', type: 'json', order: 1, dname: '' }] },
				output: { name: '', parameters: [{ name: 'output', type: 'json', order: 2, dname: '' }] },
				allowCompileAndCatalog: true,
				createSourceDir: false,
				sourceDir,
				catalogOptions: 'force',
				compileOptions: '-i -o -d',
				source,
			},
			{ headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken } },
		);
	});

	test('should deploy REST subroutine definition and compile/catalog subroutine with createSourceDir set to true', async () => {
		when<any, any[]>(mockedAxiosInstance.get)
			.calledWith('user', expect.anything())
			.mockResolvedValue({
				data: {},
				headers: { 'set-cookie': [expectedCookie] },
			})
			.calledWith(`manager/rest/${account}/subroutines`, expect.anything())
			.mockResolvedValue({ data: {} });

		const source = 'source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const deploymentManager = DeploymentManager.createDeploymentManager(
			mvisAdminUrl,
			account,
			username,
			password,
			logHandler,
		);

		const sourceDir = 'source_directory';

		await deploymentManager.deploy(sourceDir, { createDir: true });
		expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(4);
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith('user', {
			headers: { authorization: `Basic ${expectedAuthorization}` },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(`manager/rest/${account}/subroutines`, {
			headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken },
		});
		expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
			`manager/rest/${account}/loadsubroutine/${subroutineName}`,
			{ headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken } },
		);

		expect(mockedAxiosInstance.post).toHaveBeenCalledTimes(1);
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			`manager/rest/${account}/subroutine`,
			{
				name: subroutineName,
				parameter_count: 2,
				input: { name: '', parameters: [{ name: 'input', type: 'json', order: 1, dname: '' }] },
				output: { name: '', parameters: [{ name: 'output', type: 'json', order: 2, dname: '' }] },
				allowCompileAndCatalog: true,
				createSourceDir: true,
				sourceDir,
				catalogOptions: 'force',
				compileOptions: '-i -o -d',
				source,
			},
			{ headers: { Cookie: expectedCookie, 'X-XSRF-TOKEN': expectedXsrfToken } },
		);
	});
});
