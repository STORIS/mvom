import { mock, mockDeep } from 'jest-mock-extended';
import mockDelimiters from '#test/mockDelimiters';
import type { ModelConstructor } from '../compileModel';
import { InvalidParameterError, QueryLimitError } from '../errors';
import type LogHandler from '../LogHandler';
import type { Filter, QueryExecutionOptions, SortCriteria } from '../Query';
import Query from '../Query';
import type { DataTransformer, DbSubroutineOutputFind } from '../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ModelConstructorMock = mockDeep<ModelConstructor>();
const filename = 'filename';
// @ts-expect-error: Ignore readonly modifier in test
ModelConstructorMock.file = filename;

const dataTransformerMock = mock<DataTransformer>();
const logHandlerMock = mock<LogHandler>();

const { am } = mockDelimiters;

beforeEach(() => {
	dataTransformerMock.transformToQuery.mockImplementation((val) => String(val));
});

describe('constructor', () => {
	describe('errors', () => {
		test('should throw TypeError if and condition is an empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				$and: [],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw TypeError if or condition is an empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				$or: [],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw TypeError if invalid conditional operator specified', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				foo: { $foo: 'bar' },
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw InvalidParameterError if in condition is empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				foo: { $in: [] },
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(InvalidParameterError);
		});

		test('should throw Error if query condition contains both single and double quotes', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				[propertyName1]: `"This" 'shall' "not" 'pass'`,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(Error);
		});

		test('should throw InvalidParameterError if query condition specifies an unmapped dictionary', () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const selectionCritieria = {
				[propertyName1]: propertyValue1,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map();

			expect(() => {
				new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			}).toThrow(InvalidParameterError);
		});
	});
});

describe('exec', () => {
	const dbQueryResult: DbSubroutineOutputFind = {
		count: 1,
		documents: [{ _id: 'id', __v: '__v', record: `foo${am}bar` }],
	};
	beforeEach(() => {
		ModelConstructorMock.connection.executeDbSubroutine.mockResolvedValue(dbQueryResult);
	});

	describe('single conditions', () => {
		beforeEach(() => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		describe('implicit operators', () => {
			test('should construct and execute query with equality condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: propertyValue,
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: [propertyValue1, propertyValue2],
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});
		});

		describe('explicit operators', () => {
			test('should construct and execute query with equality condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $eq: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with equality condition containing double quotes', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $eq: `"${propertyValue}"` },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = '"${propertyValue}"'`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with equality condition containing single quotes', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $eq: `'${propertyValue}'` },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "'${propertyValue}'"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $in: [propertyValue1, propertyValue2] },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with in condition of length 1', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $in: [propertyValue1] },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue1}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with greater than condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $gt: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} > "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with greater than or equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $gte: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} >= "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with less than condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $lt: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} < "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with less than or equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $lte: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} <= "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with not equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $ne: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} # "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			describe('contains condition', () => {
				test('should construct and execute query with contains condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $contains: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "...'${propertyValue}'..."`;
					expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						undefined,
					);
				});

				test('should throw error if contains condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $contains: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if contains condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $contains: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			describe('startsWith condition', () => {
				test('should construct and execute query with startsWith condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $startsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "'${propertyValue}'..."`;
					expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						undefined,
					);
				});

				test('should throw error if startsWith condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $startsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if startsWith condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $startsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			describe('endsWith condition', () => {
				test('should construct and execute query with endsWith condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $endsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "...'${propertyValue}'"`;
					expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						undefined,
					);
				});

				test('should throw error if endsWith condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $endsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if endsWith condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $endsWith: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					expect(() => {
						new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			test('should construct and execute query with not in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $nin: [propertyValue1, propertyValue2] },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} # "${propertyValue1}" and ${propertyDictionary} # "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			test('should construct and execute query with no conditions', async () => {
				const propertyName = 'property-name';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename}`;
				expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					undefined,
				);
			});

			describe('transformation', () => {
				test('should run transformation for query condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = true;
					const propertyDictionary = 'property-dictionary';
					const selectionCritieria = {
						[propertyName]: { $eq: propertyValue },
					};

					// @ts-expect-error: Overriding mock
					ModelConstructorMock.schema!.dictPaths = new Map([
						[
							propertyName,
							{ dictionary: propertyDictionary, dataTransformer: dataTransformerMock },
						],
					]);

					dataTransformerMock.transformToQuery.mockReturnValue('1');

					const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} = "1"`;
					expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						undefined,
					);
					expect(dataTransformerMock.transformToQuery).toHaveBeenCalledWith(propertyValue);
				});
			});
		});
	});

	describe('multiple conditions', () => {
		beforeEach(() => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should join multiple implicit conditions with and', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				[propertyName1]: propertyValue1,
				[propertyName2]: propertyValue2,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should join multiple explicit conditions with and', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';

			interface Schema {
				[propertyName1]: string;
				[propertyName2]: string;
			}

			const selectionCritieria: Filter<Schema> = {
				$and: [
					{
						[propertyName1]: propertyValue1,
					},
					{
						[propertyName2]: propertyValue2,
					},
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should join multiple explicit conditions with or', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';

			interface Schema {
				[propertyName1]: string;
				[propertyName2]: string;
			}

			const selectionCritieria: Filter<Schema> = {
				$or: [
					{
						[propertyName1]: propertyValue1,
					},
					{
						[propertyName2]: propertyValue2,
					},
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" or ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should join multiple explicit conditions with and/or', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';
			const propertyName3 = 'property-name3';
			const propertyValue3 = 'property-value3';
			const propertyDictionary3 = 'property-dictionary3';

			interface Schema {
				[propertyName1]: string;
				[propertyName2]: string;
				[propertyName3]: string;
			}

			const selectionCritieria: Filter<Schema> = {
				$or: [
					{
						$and: [
							{
								[propertyName1]: propertyValue1,
							},
							{
								[propertyName2]: propertyValue2,
							},
						],
					},
					{ [propertyName3]: propertyValue3 },
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
				[propertyName3, { dictionary: propertyDictionary3, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should join multiple explicit or conditions with implicit and condition', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';
			const propertyName3 = 'property-name3';
			const propertyValue3 = 'property-value3';
			const propertyDictionary3 = 'property-dictionary3';

			interface Schema {
				[propertyName1]: string;
				[propertyName2]: string;
				[propertyName3]: string;
			}

			const selectionCritieria: Filter<Schema> = {
				$or: [
					{
						[propertyName1]: propertyValue1,
						[propertyName2]: propertyValue2,
					},
					{ [propertyName3]: propertyValue3 },
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
				[propertyName3, { dictionary: propertyDictionary3, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should not join explicit and conditions if array length is 1', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				$and: [
					{
						[propertyName1]: propertyValue1,
					},
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should not join explicit or conditions if array length is 1', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
				$or: [
					{
						[propertyName1]: propertyValue1,
					},
				],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should construct and execute query with property having multiple conditions', async () => {
			const propertyName = 'property-name';
			const propertyValue1 = 'property-value1';
			const propertyValue2 = 'property-value2';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: { $gte: propertyValue1, $lte: propertyValue2 },
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);

			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary} >= "${propertyValue1}" and ${propertyDictionary} <= "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});
	});

	describe('sorting', () => {
		beforeEach(() => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should not add a sort if sort array is empty', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should add an ascending sort', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [[propertyName, 1]];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by ${propertyDictionary}`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should add a descending sort', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [[propertyName, -1]];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by.dsnd ${propertyDictionary}`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should add multiple ascending sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const selectionCritieria = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, 1],
				[propertyName2, 1],
			];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should add multiple descending sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const selectionCritieria = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, -1],
				[propertyName2, -1],
			];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by.dsnd ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});

		test('should add multiple mixed sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const selectionCritieria = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, -1],
				[propertyName2, 1],
			];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});
	});

	describe('options', () => {
		beforeEach(() => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should add skip and limit if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};
			const skip = 15;
			const limit = 25;

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				skip,
				limit,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
					skip,
					limit,
				},
				undefined,
			);
		});

		test('should add execution options if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
			const executionOptions: QueryExecutionOptions = { userDefined };
			expect(await query.exec(executionOptions)).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{ userDefined },
			);
		});
	});

	describe('limits', () => {
		test('should throw QueryLimitError if query length exceeds sentence length', async () => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 10,
			});

			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if sort criteria exceeds max sort limits', async () => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 2,
				maxWith: 512,
				maxSentenceLength: 9247,
			});

			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const propertyName3 = 'property-name3';
			const propertyDictionary3 = 'property-dictionary3';

			const selectionCritieria = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, 1],
				[propertyName2, 1],
				[propertyName3, 1],
			];

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
				[propertyName3, { dictionary: propertyDictionary3, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				sort: sortCriteria,
			});
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if selection criteria exceeds max criteria limits', async () => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 2,
				maxSentenceLength: 9247,
			});

			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyValue2 = 'property-value2';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';
			const propertyName3 = 'property-name3';
			const propertyValue3 = 'property-value3';
			const propertyDictionary3 = 'property-dictionary3';

			const selectionCritieria = {
				[propertyName1]: propertyValue1,
				[propertyName2]: propertyValue2,
				[propertyName3]: propertyValue3,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
				[propertyName2, { dictionary: propertyDictionary2, dataTransformer: dataTransformerMock }],
				[propertyName3, { dictionary: propertyDictionary3, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if selection criteria exceeds max criteria limits with array criteria', async () => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 2,
				maxSentenceLength: 9247,
			});

			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyValue2 = 'property-value2';
			const propertyValue3 = 'property-value3';

			const selectionCritieria = {
				[propertyName1]: [propertyValue1, propertyValue2, propertyValue3],
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName1, { dictionary: propertyDictionary1, dataTransformer: dataTransformerMock }],
			]);

			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});
	});

	describe('projection', () => {
		beforeEach(() => {
			ModelConstructorMock.connection.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should add projection if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';
			const selectionCritieria = {
				[propertyName]: propertyValue,
			};

			// @ts-expect-error: Overriding mock
			ModelConstructorMock.schema!.dictPaths = new Map([
				[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
			]);
			ModelConstructorMock.schema!.transformPathsToDbPositions.mockReturnValue([2]);

			const projection = ['property-name'];
			const query = new Query(ModelConstructorMock, logHandlerMock, selectionCritieria, {
				projection,
			});
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: [2],
					queryCommand: expectedQuery,
				},
				undefined,
			);
		});
	});
});
