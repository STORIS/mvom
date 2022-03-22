import { mock, mockDeep } from 'jest-mock-extended';
import type { ModelConstructor } from '../compileModel';
import { InvalidParameterError } from '../errors';
import type { SortCriteria } from '../Query';
import Query from '../Query';
import type { DataTransformer, DbSubroutineOutputFind } from '../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ModelConstructorMock = mockDeep<ModelConstructor>();
const filename = 'filename';
// @ts-expect-error: Ignore readonly modifier in test
ModelConstructorMock.file = filename;

const dataTransformerMock = mock<DataTransformer>();

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
				new Query(ModelConstructorMock, selectionCritieria);
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
				new Query(ModelConstructorMock, selectionCritieria);
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
				new Query(ModelConstructorMock, selectionCritieria);
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
				new Query(ModelConstructorMock, selectionCritieria);
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
				new Query(ModelConstructorMock, selectionCritieria);
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
				new Query(ModelConstructorMock, selectionCritieria);
			}).toThrow(InvalidParameterError);
		});
	});
});

describe('exec', () => {
	const dbQueryResult: DbSubroutineOutputFind = {
		count: 1,
		documents: [{ _id: 'id', __v: '__v', record: ['foo', 'bar'] }],
	};
	beforeEach(() => {
		ModelConstructorMock.connection.executeDbFeature.mockResolvedValue(dbQueryResult);
	});

	describe('single conditions', () => {
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

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = '"${propertyValue}"'`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "'${propertyValue}'"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue1}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} > "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} >= "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} < "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} <= "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} # "${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
			});

			test('should construct and execute query with contains condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $contains: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} like "...${propertyValue}..."`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
			});

			test('should construct and execute query with startsWith condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $startsWith: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} like "${propertyValue}..."`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
			});

			test('should construct and execute query with endsWith condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {
					[propertyName]: { $endsWith: propertyValue },
				};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, selectionCritieria);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} like "...${propertyValue}"`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
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

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} # "${propertyValue1}" and ${propertyDictionary} # "${propertyValue2}")`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
			});

			test('should construct and execute query with no conditions', async () => {
				const propertyName = 'property-name';
				const propertyDictionary = 'property-dictionary';
				const selectionCritieria = {};

				// @ts-expect-error: Overriding mock
				ModelConstructorMock.schema!.dictPaths = new Map([
					[propertyName, { dictionary: propertyDictionary, dataTransformer: dataTransformerMock }],
				]);

				const query = new Query(ModelConstructorMock, selectionCritieria);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename}`;
				expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
					filename,
					projection: [],
					queryCommand: expectedQuery,
				});
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

					const query = new Query(ModelConstructorMock, selectionCritieria);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} = "1"`;
					expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
						filename,
						projection: [],
						queryCommand: expectedQuery,
					});
					expect(dataTransformerMock.transformToQuery).toHaveBeenCalledWith(propertyValue);
				});
			});
		});
	});

	describe('multiple conditions', () => {
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
		});

		test('should join multiple explicit conditions with and', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
		});

		test('should join multiple explicit conditions with or', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';
			const selectionCritieria = {
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" or ${propertyDictionary2} = "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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
			const selectionCritieria = {
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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
			const selectionCritieria = {
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria);

			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary} >= "${propertyValue1}" and ${propertyDictionary} <= "${propertyValue2}")`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
		});
	});

	describe('sorting', () => {
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by ${propertyDictionary}`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by.dsnd ${propertyDictionary}`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by.dsnd ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { sort: sortCriteria });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
			});
		});
	});

	describe('options', () => {
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

			const query = new Query(ModelConstructorMock, selectionCritieria, { skip, limit });
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(ModelConstructorMock.connection.executeDbFeature).toHaveBeenCalledWith('find', {
				filename,
				projection: [],
				queryCommand: expectedQuery,
				skip,
				limit,
			});
		});
	});
});
