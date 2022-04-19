import type http from 'http';
import type https from 'https';
import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import fs from 'fs-extra';
import { mock } from 'jest-mock-extended';
import { when } from 'jest-when';
import { minVersion } from 'semver';
import mockDelimiters from '#test/mockDelimiters';
import type { CreateConnectionOptions, Logger } from '../Connection';
import Connection, { ConnectionStatus } from '../Connection';
import { dbErrors } from '../constants';
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
import { dependencies as serverDependencies } from '../manifest.json';

jest.mock('axios');
jest.mock('fs-extra');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAxiosInstance = mock<AxiosInstance>();
const mockedFs = fs as jest.Mocked<typeof fs>;

const mvisUri = 'mvisUri';
const account = 'account';

const fullFeatureOutput = Object.entries(serverDependencies).map(
	([dependencyName, dependencyVersion]) => {
		const version = minVersion(dependencyVersion);
		const fullFeatureName = `mvom_${dependencyName}@${version}`;
		return fullFeatureName;
	},
);

beforeEach(() => {
	mockedAxios.create.mockReturnValue(mockedAxiosInstance);
});

describe('createConnection', () => {
	test('should throw InvalidParameterError if cacheMaxAge is not an integer', () => {
		const options: CreateConnectionOptions = {
			cacheMaxAge: 1.23,
		};

		expect(() => {
			Connection.createConnection(mvisUri, account, options);
		}).toThrow(InvalidParameterError);
	});

	test('should throw InvalidParameterError if timeout is not an integer', () => {
		const options: CreateConnectionOptions = {
			timeout: 1.23,
		};

		expect(() => {
			Connection.createConnection(mvisUri, account, options);
		}).toThrow(InvalidParameterError);
	});

	test('should return a new Connection instance', () => {
		expect(Connection.createConnection(mvisUri, account)).toBeInstanceOf(Connection);
	});

	test('should include mvisUri and account in base url', () => {
		Connection.createConnection(mvisUri, account);
		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ baseURL: expect.stringContaining(`${mvisUri}/${account}`) }),
		);
	});

	test('should allow for override of Logger', () => {
		const loggerMock = mock<Logger>();

		const connection = Connection.createConnection(mvisUri, account, { logger: loggerMock });

		const message = 'test message';
		connection.logMessage('silly', message);
		expect(loggerMock.silly).toHaveBeenCalledWith(`[${account}] ${message}`);
	});

	test('should allow for override of timeout', () => {
		const timeout = 1;

		Connection.createConnection(mvisUri, account, { timeout });
		expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({ timeout }));
	});

	test('should allow for override of httpAgent', () => {
		const httpAgentMock = mock<http.Agent>();

		Connection.createConnection(mvisUri, account, { httpAgent: httpAgentMock });
		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpAgent: httpAgentMock }),
		);
	});

	test('should allow for override of httpsAgent', () => {
		const httpsAgentMock = mock<https.Agent>();

		Connection.createConnection(mvisUri, account, { httpsAgent: httpsAgentMock });
		expect(mockedAxios.create).toHaveBeenCalledWith(
			expect.objectContaining({ httpsAgent: httpsAgentMock }),
		);
	});
});

describe('open', () => {
	test('should throw InvalidServerFeaturesError if any database features are missing', async () => {
		mockedAxiosInstance.post.mockResolvedValue({ data: { output: { features: [] } } });

		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should ignore database features with improper formatting and throw InvalidServerFeaturesError', async () => {
		mockedAxiosInstance.post.mockResolvedValue({
			data: { output: { features: ['mvom_feature@foo.bar.baz', 'mvom_feature@1.1.1.leftover'] } },
		});

		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should throw InvalidServerFeaturesError if backend feature version is not semver compatible with required version', async () => {
		const featureOutput = Object.entries(serverDependencies).map(
			([dependencyName, dependencyVersion], idx) => {
				// set version of first dependency to something that will guarantee incompatibility
				const version = idx === 0 ? '0.0.0' : minVersion(dependencyVersion);
				const fullFeatureName = `mvom_${dependencyName}@${version}`;
				return fullFeatureName;
			},
		);

		mockedAxiosInstance.post.mockResolvedValue({
			data: { output: { features: featureOutput } },
		});

		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should open new connection', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: { output: { date: 19791, time: 43200000, delimiters: mockDelimiters } },
			});

		const connection = Connection.createConnection(mvisUri, account);

		await connection.open();
		expect(connection.status).toBe(ConnectionStatus.connected);
	});
});

describe('deployFeatures', () => {
	test('should not deploy any features if feature state is valid', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } });

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir);

		expect(mockedAxiosInstance.post).toHaveBeenCalledTimes(1); // only a single call to get the feature state
	});

	test('should create directory and deploy missing features', async () => {
		const missingFeatureName = Object.keys(serverDependencies).shift()!;

		const featureOutput = fullFeatureOutput.slice(1); // remove the first feature from the list

		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: featureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'createDir' }) }),
			)
			.mockResolvedValue({ data: { output: {} } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('deploy'),
					}),
				}),
			)
			.mockResolvedValue({ data: { output: { deployed: missingFeatureName } } });

		const source = 'some unibasic source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir, { createDir: true });
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ input: expect.objectContaining({ action: 'createDir' }) }),
		);
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				input: expect.objectContaining({
					action: 'subroutine',
					subroutineId: expect.stringContaining('deploy'),
					options: expect.objectContaining({
						sourceDir,
						source,
						programName: expect.stringContaining(missingFeatureName),
					}),
				}),
			}),
		);
	});

	test('should deploy bootstrapped features', async () => {
		const featureOutput = Object.entries(serverDependencies)
			.filter(([dependencyName]) => dependencyName !== 'setup') // remove setup bootstrapped dependency
			.map(([dependencyName, dependencyVersion]) => {
				const version = minVersion(dependencyVersion);
				const fullFeatureName = `mvom_${dependencyName}@${version}`;
				return fullFeatureName;
			});

		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValueOnce({ data: { output: { features: featureOutput } } })
			.mockResolvedValueOnce({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'deploy' }) }),
			)
			.mockResolvedValue({ data: { output: { deployed: 'setup' } } });

		const source = 'some unibasic source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir);
		expect(mockedAxiosInstance.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				input: expect.objectContaining({
					action: 'deploy',
					sourceDir,
					source,
					programName: expect.stringContaining('setup'),
				}),
			}),
		);
	});
});

describe('executeDbFeature', () => {
	beforeEach(() => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});
	});

	test('should throw DbServerError if response payload has a null output', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({ data: { output: null } });

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.foreignKeyValidation.code, foreignKeyValidationErrors: [] },
				},
			});

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.recordLocked.code },
				},
			});

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.recordVersion.code },
				},
			});

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockResolvedValue({
				data: {
					output: { errorCode: dbErrors.malformedInput.code },
				},
			});

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(err);

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
			)
			.mockRejectedValue(errMsg);

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
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
		jest.useFakeTimers('modern');
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should throw an error if connection has not been opened', async () => {
		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.getDbDate()).rejects.toThrow();
	});

	test('should return current db server date if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '2022-03-08';
		expect(await connection.getDbDate()).toEqual(expected);
	});

	test('should return current db server date when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '2022-03-08';
		expect(await connection.getDbDate()).toEqual(expected);
	});
});

describe('getDbDateTime', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should throw an error if connection has not been opened', async () => {
		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.getDbDateTime()).rejects.toThrow();
	});

	test('should return current db server date and time if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '2022-03-08T12:00:00.000';
		expect(await connection.getDbDateTime()).toEqual(expected);
	});

	test('should return current db server date and time when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '2022-03-08T12:00:00.000';
		expect(await connection.getDbDateTime()).toEqual(expected);
	});
});

describe('getDbTime', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should throw an error if connection has not been opened', async () => {
		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.getDbTime()).rejects.toThrow();
	});

	test('should return current db server time if there is no time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T12:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '12:00:00.000';
		expect(await connection.getDbTime()).toEqual(expected);
	});

	test('should return current db server time when there is time drift', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
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
					},
				},
			});

		jest.setSystemTime(new Date('2022-03-08T17:00:00.000'));

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const expected = '12:00:00.000';
		expect(await connection.getDbTime()).toEqual(expected);
	});
});

describe('model', () => {
	test('should throw Error if connection has not been opened', () => {
		const connection = Connection.createConnection(mvisUri, account);

		const file = 'file';
		expect(() => {
			connection.model(null, file);
		}).toThrow(Error);
	});

	test('should return compiled model', async () => {
		when<any, any[]>(mockedAxiosInstance.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('getServerInfo'),
					}),
				}),
			)
			.mockResolvedValue({
				data: { output: { date: 19791, time: 43200000, delimiters: mockDelimiters } },
			});

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const file = 'file';
		const Model = connection.model(null, file);
		expect(typeof Model === 'function').toBe(true);
	});
});
