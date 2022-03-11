import axios from 'axios';
import fs from 'fs-extra';
import { when } from 'jest-when';
import { minVersion } from 'semver';
import { dependencies as serverDependencies } from '../.mvomrc.json';
import type { CreateConnectionOptions } from '../Connection';
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
} from '../errors';

jest.mock('axios');
jest.mock('fs-extra');
const mockedAxios = axios as jest.Mocked<typeof axios>;
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
});

describe('open', () => {
	test('should throw InvalidServerFeaturesError if any database features are missing', async () => {
		mockedAxios.post.mockResolvedValue({ data: { output: { features: [] } } });

		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should ignore database features with improper formatting and throw InvalidServerFeaturesError', async () => {
		mockedAxios.post.mockResolvedValue({
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

		mockedAxios.post.mockResolvedValue({
			data: { output: { features: featureOutput } },
		});

		const connection = Connection.createConnection(mvisUri, account);

		await expect(connection.open()).rejects.toThrow(InvalidServerFeaturesError);
	});

	test('should open new connection', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { date: 19791, time: 43200000 } } });

		const connection = Connection.createConnection(mvisUri, account);

		await connection.open();
		expect(connection.status).toBe(ConnectionStatus.connected);
	});
});

describe('deployFeatures', () => {
	test('should not deploy any features if feature state is valid', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { features: fullFeatureOutput } } });

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir);

		expect(mockedAxios.post).toHaveBeenCalledTimes(1); // only a single call to get the feature state
	});

	test('should create directory and deploy missing features', async () => {
		const missingFeatureName = Object.keys(serverDependencies).shift()!;

		const featureOutput = fullFeatureOutput.slice(1); // remove the first feature from the list

		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { features: featureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'createDir' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { deployed: missingFeatureName } } });

		const source = 'some unibasic source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir, { createDir: true });
		expect(mockedAxios.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ input: expect.objectContaining({ action: 'createDir' }) }),
			expect.anything(),
		);
		expect(mockedAxios.post).toHaveBeenCalledWith(
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
			expect.anything(),
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

		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
			)
			.mockResolvedValueOnce({ data: { output: { features: featureOutput } } })
			.mockResolvedValueOnce({ data: { output: { features: fullFeatureOutput } } })
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'deploy' }) }),
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { deployed: 'setup' } } });

		const source = 'some unibasic source code';
		// @ts-ignore: mock not respecting overload
		mockedFs.readFile.mockResolvedValue(source);

		const connection = Connection.createConnection(mvisUri, account);

		const sourceDir = 'sourceDir';
		await connection.deployFeatures(sourceDir);
		expect(mockedAxios.post).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				input: expect.objectContaining({
					action: 'deploy',
					sourceDir,
					source,
					programName: expect.stringContaining('setup'),
				}),
			}),
			expect.anything(),
		);
	});
});

describe('executeDbFeature', () => {
	beforeEach(() => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
					},
				},
			});
	});

	test('should throw DbServerError if response payload has a null output', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: null } });

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
				filename,
				id,
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(DbServerError);
	});

	test('should throw ForeignKeyValidationError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
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
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(ForeignKeyValidationError);
	});

	test('should throw RecordLockedError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
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
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(RecordLockedError);
	});

	test('should throw RecordVersionError when that code is returned from db', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
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
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(RecordVersionError);
	});

	test('should throw DbServerError for other returned codes', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
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
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(DbServerError);
	});

	test('should throw MvisError if axios call rejects', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({
					input: expect.objectContaining({
						action: 'subroutine',
						subroutineId: expect.stringContaining('save'),
					}),
				}),
				expect.anything(),
			)
			.mockRejectedValue(new Error('test error'));

		const connection = Connection.createConnection(mvisUri, account);

		const filename = 'filename';
		const id = 'id';
		await expect(
			connection.executeDbFeature('save', {
				filename,
				id,
				record: [],
				clearAttributes: false,
				foreignKeyDefinitions: [],
			}),
		).rejects.toThrow(MvisError);
	});
});

describe('getDbDate', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('should return current db server date if there is no time drift', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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

	test('should return current db server date and time if there is no time drift', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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

	test('should return current db server time if there is no time drift', async () => {
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({
				data: {
					output: {
						date: 19791, // 2022-03-08
						time: 43200000, // 12:00:00.000
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
		when<any, any[]>(mockedAxios.post)
			.calledWith(
				expect.any(String),
				expect.objectContaining({ input: expect.objectContaining({ action: 'featureList' }) }),
				expect.anything(),
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
				expect.anything(),
			)
			.mockResolvedValue({ data: { output: { date: 19791, time: 43200000 } } });

		const connection = Connection.createConnection(mvisUri, account);
		await connection.open();

		const file = 'file';
		const Model = connection.model(null, file);
		expect(typeof Model === 'function').toBe(true);
	});
});
