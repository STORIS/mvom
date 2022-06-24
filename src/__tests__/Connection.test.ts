import type http from 'http';
import type https from 'https';
import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { mock } from 'jest-mock-extended';
import { when } from 'jest-when';
import mockDelimiters from '#test/mockDelimiters';
import type { CreateConnectionOptions } from '../Connection';
import Connection, { ConnectionStatus } from '../Connection';
import { dbErrors } from '../constants';
import type DeploymentManager from '../DeploymentManager';
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
} from '../errors';
import type { Logger } from '../LogHandler';

jest.mock('axios');

const mockDeploymentManager = mock<DeploymentManager>();
jest.mock('../DeploymentManager', () => ({ createDeploymentManager: () => mockDeploymentManager }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosInstance = mock<AxiosInstance>();

const mvisUrl = 'http://foo.bar.com/mvis';
const mvisAdminUrl = 'http://foo.bar.com/mvisAdmin';
const mvisAdminUsername = 'username';
const mvisAdminPassword = 'password';
const account = 'account';

beforeEach(() => {
	mockedAxios.create.mockReturnValue(mockedAxiosInstance);
});

describe('createConnection', () => {
	test('should throw InvalidParameterError if cacheMaxAge is not an integer', () => {
		const options: CreateConnectionOptions = {
			cacheMaxAge: 1.23,
		};

		expect(() => {
			Connection.createConnection(
				mvisUrl,
				mvisAdminUrl,
				mvisAdminUsername,
				mvisAdminPassword,
				account,
				options,
			);
		}).toThrow(InvalidParameterError);
	});

	test('should throw InvalidParameterError if timeout is not an integer', () => {
		const options: CreateConnectionOptions = {
			timeout: 1.23,
		};

		expect(() => {
			Connection.createConnection(
				mvisUrl,
				mvisAdminUrl,
				mvisAdminUsername,
				mvisAdminPassword,
				account,
				options,
			);
		}).toThrow(InvalidParameterError);
	});

	test('should return a new Connection instance', () => {
		expect(
			Connection.createConnection(
				mvisUrl,
				mvisAdminUrl,
				mvisAdminUsername,
				mvisAdminPassword,
				account,
			),
		).toBeInstanceOf(Connection);
	});

	test('should construct complete base url for calls to mvis', () => {
		Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		const expected = `${mvisUrl}/${account}/subroutine/`;

		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({
				baseURL: expect.stringMatching(expected),
			}),
		);
	});

	test('should construct complete base url for calls to mvis if trailing slash added to mvisUri', () => {
		Connection.createConnection(
			`${mvisUrl}/`,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		const expected = `${mvisUrl}/${account}/subroutine/`;

		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({
				baseURL: expect.stringMatching(expected),
			}),
		);
	});

	test('should allow for override of Logger', () => {
		const loggerMock = mock<Logger>();

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
			{ logger: loggerMock },
		);

		const message = 'test message';
		// @ts-expect-error: accessing private member in test
		connection.logHandler.silly(message);
		expect(loggerMock.silly).toHaveBeenCalledWith(`[${account}] ${message}`);
	});

	test('should allow for override of timeout', () => {
		const timeout = 1;

		Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
			{ timeout },
		);
		expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({ timeout }));
	});

	test('should allow for override of httpAgent', () => {
		const httpAgentMock = mock<http.Agent>();

		Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
			{ httpAgent: httpAgentMock },
		);
		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpAgent: httpAgentMock }),
		);
	});

	test('should allow for override of httpsAgent', () => {
		const httpsAgentMock = mock<https.Agent>();

		Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
			{ httpsAgent: httpsAgentMock },
		);
		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpsAgent: httpsAgentMock }),
		);
	});
});

describe('open', () => {
	test('should throw InvalidServerFeaturesError if database features are missing', async () => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(false);

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should open new connection', async () => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);

		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791,
						time: 43200000,
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		await connection.open();
		expect(connection.status).toBe(ConnectionStatus.connected);
	});
});

describe('deploy', () => {
	test('should call the deployment manager deploy method without options', async () => {
		const sourceDir = 'sourceDir';

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		await connection.deploy(sourceDir);

		expect(mockDeploymentManager.deploy).toHaveBeenCalledWith(sourceDir, undefined);
	});

	test('should call the deployment manager deploy method with options', async () => {
		const sourceDir = 'sourceDir';
		const options = { createDir: true };

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		await connection.deploy(sourceDir, options);

		expect(mockDeploymentManager.deploy).toHaveBeenCalledWith(sourceDir, options);
	});
});

describe('executeDbSubroutine', () => {
	beforeEach(() => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);

		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});
	});

	test('should reject if database connection has not been opened', async () => {
		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow();
	});

	test('should throw DbServerError if response payload has a null output', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({ data: { output: null } });

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(DbServerError);
	});

	test('should throw ForeignKeyValidationError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.foreignKeyValidation.code, foreignKeyValidationErrors: [] },
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(ForeignKeyValidationError);
	});

	test('should throw RecordLockedError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.recordLocked.code },
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(RecordLockedError);
	});

	test('should throw RecordVersionError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.recordVersion.code },
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(RecordVersionError);
	});

	test('should throw DbServerError for other returned codes', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.malformedInput.code },
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(DbServerError);
	});

	test('should throw MvisError if axios call rejects with an AxiosError that is not a timeout', async () => {
		const err = new Error('test error') as AxiosError;
		mockedAxios.isAxiosError.mockReturnValue(true);
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(MvisError);
	});

	test('should throw TimeoutError if axios call rejects with an AxiosError that is a timeout', async () => {
		const err = new Error('test error') as AxiosError;
		err.code = 'ETIMEDOUT';
		mockedAxios.isAxiosError.mockReturnValue(true);
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(TimeoutError);
	});

	test("should throw UnknownError with error's message if axios call rejects with an Error other than an AxiosError", async () => {
		const errMsg = 'test error';
		const err = new Error(errMsg);
		mockedAxios.isAxiosError.mockReturnValue(false);
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(new UnknownError({ message: errMsg }));
	});

	test('should throw UnknownError if axios call rejects with something other than an error', async () => {
		const errMsg = 'test error';
		mockedAxios.isAxiosError.mockReturnValue(false);
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(errMsg);

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbSubroutine('save', {
				filename,
				id,
				record: '',
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(UnknownError);
	});
});

describe('getDbDate', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	beforeEach(() => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should return current db server date if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '2022-03-08';
		expect(await connection.getDbDate()).toEqual(expected);
	});

	test('should return current db server date when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '2022-03-08';
		expect(await connection.getDbDate()).toEqual(expected);
	});
});

describe('getDbDateTime', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	beforeEach(() => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should return current db server date and time if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '2022-03-08T12:00:00.000';
		expect(await connection.getDbDateTime()).toEqual(expected);
	});

	test('should return current db server date and time when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '2022-03-08T12:00:00.000';
		expect(await connection.getDbDateTime()).toEqual(expected);
	});
});

describe('getDbTime', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	beforeEach(() => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should return current db server time if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '12:00:00.000';
		expect(await connection.getDbTime()).toEqual(expected);
	});

	test('should return current db server time when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = '12:00:00.000';
		expect(await connection.getDbTime()).toEqual(expected);
	});
});

describe('getDbLimits', () => {
	beforeEach(() => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);
	});

	test('should return limit values returned by database server', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const expected = { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 };
		expect(await connection.getDbLimits()).toEqual(expected);
	});
});

describe('model', () => {
	test('should throw Error if connection has not been opened', () => {
		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);

		const file = 'file';
		expect(() => {
			connection.model(null, file);
		}).toThrow(Error);
	});

	test('should return compiled model', async () => {
		mockDeploymentManager.validateDeployment.mockResolvedValue(true);

		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.anything(),
				expect.objectContaining({
					input: expect.objectContaining({
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791,
						time: 43200000,
						delimiters: mockDelimiters,
						limits: { maxSort: 20, maxWith: 512, maxSentenceLength: 9247 },
					},
				},
			});

		const connection = Connection.createConnection(
			mvisUrl,
			mvisAdminUrl,
			mvisAdminUsername,
			mvisAdminPassword,
			account,
		);
		await connection.open();

		const file = 'file';
		const Model = connection.model(null, file);
		expect(typeof Model === 'function').toBe(true);
	});
});
