import { mock, mockDeep } from 'jest-mock-extended';
import mockDelimiters from '#test/mockDelimiters';
import type Connection from '../Connection';
import { InvalidParameterError, QueryLimitError } from '../errors';
import type LogHandler from '../LogHandler';
import type { Condition, Filter, QueryExecutionOptions, SortCriteria } from '../Query';
import Query from '../Query';
import type { ISOCalendarDate, ISOCalendarDateTime, ISOTime } from '../Schema';
import Schema from '../Schema';
import type { DbSubroutineOutputFind, Equals } from '../types';

const connectionMock = mockDeep<Connection>();
const filename = 'filename';
const requestId = 'requestId';

const logHandlerMock = mock<LogHandler>();

const { am } = mockDelimiters;

describe('constructor', () => {
	describe('errors', () => {
		test('should throw TypeError if and condition is an empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$and: [],
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw TypeError if or condition is an empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$or: [],
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw TypeError if invalid conditional operator specified', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				// @ts-expect-error: Testing invalid input
				[propertyName1]: { $foo: 'bar' },
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			}).toThrow(TypeError);
		});

		test('should throw InvalidParameterError if in condition is empty array', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				// @ts-expect-error: Testing invalid input
				foo: { $in: [] },
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			}).toThrow(InvalidParameterError);
		});

		test('should throw Error if query condition contains both single and double quotes', () => {
			const propertyName1 = 'property-name1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: `"This" 'shall' "not" 'pass'`,
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			}).toThrow(Error);
		});

		test('should throw InvalidParameterError if query condition specifies an unmapped dictionary', () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
			};

			expect(() => {
				new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
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
		connectionMock.executeDbSubroutine.mockResolvedValue(dbQueryResult);
	});

	describe('single conditions', () => {
		beforeEach(() => {
			connectionMock.getDbLimits.mockResolvedValue({
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

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: propertyValue,
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: [propertyValue1, propertyValue2],
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});
		});

		describe('explicit operators', () => {
			test('should construct and execute query with equality condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $eq: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with equality condition containing double quotes', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $eq: `"${propertyValue}"` },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = '"${propertyValue}"'`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with equality condition containing single quotes', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $eq: `'${propertyValue}'` },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "'${propertyValue}'"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $in: [propertyValue1, propertyValue2] },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} = "${propertyValue1}" or ${propertyDictionary} = "${propertyValue2}")`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with in condition of length 1', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $in: [propertyValue1] },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue1}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with greater than condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $gt: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} > "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with greater than or equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $gte: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} >= "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with less than condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $lt: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} < "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with less than or equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $lte: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} <= "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with not equal condition', async () => {
				const propertyName = 'property-name';
				const propertyValue = 'property-value';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $ne: propertyValue },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);

				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with ${propertyDictionary} # "${propertyValue}"`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			describe('contains condition', () => {
				test('should construct and execute query with contains condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $contains: propertyValue },
					};

					const query = new Query(
						connectionMock,
						schema,
						filename,
						logHandlerMock,
						selectionCritieria,
					);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "...'${propertyValue}'..."`;
					expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						{},
					);
				});

				test('should throw error if contains condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $contains: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if contains condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $contains: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			describe('startsWith condition', () => {
				test('should construct and execute query with startsWith condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $startsWith: propertyValue },
					};

					const query = new Query(
						connectionMock,
						schema,
						filename,
						logHandlerMock,
						selectionCritieria,
					);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "'${propertyValue}'..."`;
					expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						{},
					);
				});

				test('should throw error if startsWith condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $startsWith: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if startsWith condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $startsWith: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			describe('endsWith condition', () => {
				test('should construct and execute query with endsWith condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $endsWith: propertyValue },
					};

					const query = new Query(
						connectionMock,
						schema,
						filename,
						logHandlerMock,
						selectionCritieria,
					);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} like "...'${propertyValue}'"`;
					expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						{},
					);
				});

				test('should throw error if endsWith condition contains double quote', () => {
					const propertyName = 'property-name';
					const propertyValue = 'property-value"';
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $endsWith: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});

				test('should throw error if endsWith condition contains single quote', () => {
					const propertyName = 'property-name';
					const propertyValue = "property-value'";
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $endsWith: propertyValue },
					};

					expect(() => {
						new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
					}).toThrow();
				});
			});

			test('should construct and execute query with not in condition', async () => {
				const propertyName = 'property-name';
				const propertyValue1 = 'property-value1';
				const propertyValue2 = 'property-value2';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {
					[propertyName]: { $nin: [propertyValue1, propertyValue2] },
				};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename} with (${propertyDictionary} # "${propertyValue1}" and ${propertyDictionary} # "${propertyValue2}")`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			test('should construct and execute query with no conditions', async () => {
				const propertyName = 'property-name';
				const propertyDictionary = 'property-dictionary';

				const schema = new Schema({
					[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
				});
				const selectionCritieria: Filter<typeof schema> = {};

				const query = new Query(
					connectionMock,
					schema,
					filename,
					logHandlerMock,
					selectionCritieria,
				);
				expect(await query.exec()).toEqual(dbQueryResult);

				const expectedQuery = `select ${filename}`;
				expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
					'find',
					{
						filename,
						projection: null,
						queryCommand: expectedQuery,
					},
					{},
				);
			});

			describe('transformation', () => {
				test('should run transformation for query condition', async () => {
					const propertyName = 'property-name';
					const propertyValue = true;
					const propertyDictionary = 'property-dictionary';

					const schema = new Schema({
						[propertyName]: { type: 'boolean', path: 1, dictionary: propertyDictionary },
					});
					const selectionCritieria: Filter<typeof schema> = {
						[propertyName]: { $eq: propertyValue },
					};

					const query = new Query(
						connectionMock,
						schema,
						filename,
						logHandlerMock,
						selectionCritieria,
					);

					expect(await query.exec()).toEqual(dbQueryResult);

					const expectedQuery = `select ${filename} with ${propertyDictionary} = "1"`;
					expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
						'find',
						{
							filename,
							projection: null,
							queryCommand: expectedQuery,
						},
						{},
					);
				});
			});
		});
	});

	describe('multiple conditions', () => {
		beforeEach(() => {
			connectionMock.getDbLimits.mockResolvedValue({
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

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});

			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
				[propertyName2]: propertyValue2,
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should join multiple explicit conditions with and', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$and: [
					{
						[propertyName1]: propertyValue1,
					},
					{
						[propertyName2]: propertyValue2,
					},
				],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should join multiple explicit conditions with or', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyValue2 = 'property-value2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$or: [
					{
						[propertyName1]: propertyValue1,
					},
					{
						[propertyName2]: propertyValue2,
					},
				],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary1} = "${propertyValue1}" or ${propertyDictionary2} = "${propertyValue2}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
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

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
				[propertyName3]: { type: 'string', path: 3, dictionary: propertyDictionary3 },
			});
			const selectionCritieria: Filter<typeof schema> = {
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

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
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

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
				[propertyName3]: { type: 'string', path: 3, dictionary: propertyDictionary3 },
			});

			const selectionCritieria: Filter<typeof schema> = {
				$or: [
					{
						[propertyName1]: propertyValue1,
						[propertyName2]: propertyValue2,
					},
					{ [propertyName3]: propertyValue3 },
				],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ((${propertyDictionary1} = "${propertyValue1}" and ${propertyDictionary2} = "${propertyValue2}") or ${propertyDictionary3} = "${propertyValue3}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should not join explicit and conditions if array length is 1', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$and: [
					{
						[propertyName1]: propertyValue1,
					},
				],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should not join explicit or conditions if array length is 1', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				$or: [
					{
						[propertyName1]: propertyValue1,
					},
				],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should construct and execute query with property having multiple conditions', async () => {
			const propertyName = 'property-name';
			const propertyValue1 = 'property-value1';
			const propertyValue2 = 'property-value2';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: { $gte: propertyValue1, $lte: propertyValue2 },
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);

			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with (${propertyDictionary} >= "${propertyValue1}" and ${propertyDictionary} <= "${propertyValue2}")`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});
	});

	describe('sorting', () => {
		beforeEach(() => {
			connectionMock.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should not add a sort if sort array is empty', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should add an ascending sort', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [[propertyName, 1]];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by ${propertyDictionary}`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should add a descending sort', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};
			const sortCriteria: SortCriteria = [[propertyName, -1]];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}" by.dsnd ${propertyDictionary}`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should add multiple ascending sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, 1],
				[propertyName2, 1],
			];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should add multiple descending sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, -1],
				[propertyName2, -1],
			];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by.dsnd ${propertyDictionary2}`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});

		test('should add multiple mixed sorts', async () => {
			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyName2 = 'property-name2';
			const propertyDictionary2 = 'property-dictionary2';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, -1],
				[propertyName2, 1],
			];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary1} = "${propertyValue1}" by.dsnd ${propertyDictionary1} by ${propertyDictionary2}`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{},
			);
		});
	});

	describe('options', () => {
		beforeEach(() => {
			connectionMock.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should add skip and limit if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};
			const skip = 15;
			const limit = 25;

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					skip,
					limit,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
					skip,
					limit,
				},
				{},
			);
		});

		test('should add execution options if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
			const maxReturnPayloadSize = 10_000;
			const executionOptions: QueryExecutionOptions = {
				userDefined,
				maxReturnPayloadSize,
				requestId,
			};
			expect(await query.exec(executionOptions)).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: null,
					queryCommand: expectedQuery,
				},
				{ maxReturnPayloadSize, requestId, userDefined },
			);
		});
	});

	describe('limits', () => {
		test('should throw QueryLimitError if query length exceeds sentence length', async () => {
			connectionMock.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 10,
			});

			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 1, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if sort criteria exceeds max sort limits', async () => {
			connectionMock.getDbLimits.mockResolvedValue({
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

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
				[propertyName3]: { type: 'string', path: 3, dictionary: propertyDictionary3 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
			};
			const sortCriteria: SortCriteria = [
				[propertyName1, 1],
				[propertyName2, 1],
				[propertyName3, 1],
			];

			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					sort: sortCriteria,
				},
			);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if selection criteria exceeds max criteria limits', async () => {
			connectionMock.getDbLimits.mockResolvedValue({
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

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
				[propertyName2]: { type: 'string', path: 2, dictionary: propertyDictionary2 },
				[propertyName3]: { type: 'string', path: 3, dictionary: propertyDictionary3 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: propertyValue1,
				[propertyName2]: propertyValue2,
				[propertyName3]: propertyValue3,
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});

		test('should throw QueryLimitError if selection criteria exceeds max criteria limits with array criteria', async () => {
			connectionMock.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 2,
				maxSentenceLength: 9247,
			});

			const propertyName1 = 'property-name1';
			const propertyValue1 = 'property-value1';
			const propertyDictionary1 = 'property-dictionary1';
			const propertyValue2 = 'property-value2';
			const propertyValue3 = 'property-value3';

			const schema = new Schema({
				[propertyName1]: { type: 'string', path: 1, dictionary: propertyDictionary1 },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName1]: [propertyValue1, propertyValue2, propertyValue3],
			};

			const query = new Query(connectionMock, schema, filename, logHandlerMock, selectionCritieria);
			await expect(query.exec()).rejects.toThrow(QueryLimitError);
		});
	});

	describe('projection', () => {
		beforeEach(() => {
			connectionMock.getDbLimits.mockResolvedValue({
				maxSort: 20,
				maxWith: 512,
				maxSentenceLength: 9247,
			});
		});

		test('should add projection if specified', async () => {
			const propertyName = 'property-name';
			const propertyValue = 'property-value';
			const propertyDictionary = 'property-dictionary';

			const schema = new Schema({
				[propertyName]: { type: 'string', path: 2, dictionary: propertyDictionary },
			});
			const selectionCritieria: Filter<typeof schema> = {
				[propertyName]: propertyValue,
			};

			const projection = ['property-name'];
			const query = new Query(
				connectionMock,
				schema,
				filename,
				logHandlerMock,
				selectionCritieria,
				{
					projection,
				},
			);
			expect(await query.exec()).toEqual(dbQueryResult);

			const expectedQuery = `select ${filename} with ${propertyDictionary} = "${propertyValue}"`;
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'find',
				{
					filename,
					projection: [2],
					queryCommand: expectedQuery,
				},
				{},
			);
		});
	});
});

describe('utility types', () => {
	describe('Filter', () => {
		test('should allow for a filter with a single schema property', () => {
			const schema = new Schema({ stringProp: { type: 'string', path: '1' } });

			const test1: Equals<
				Filter<typeof schema>,
				{
					$and?: Filter<typeof schema>[];
					$or?: Filter<typeof schema>[];
					stringProp?: Condition<string>;
					_id?: Condition<string>;
				}
			> = true;
			expect(test1).toBe(true);
		});

		test('should construct filter type from a single dictionary', () => {
			const schema = new Schema({}, { dictionaries: { stringDictionary: 'STRING_DICTIONARY' } });
			const test1: Equals<
				Filter<typeof schema>,
				{
					$and?: Filter<typeof schema>[];
					$or?: Filter<typeof schema>[];
					stringDictionary?: Condition<string>;
					_id?: Condition<string>;
				}
			> = true;
			expect(test1).toBe(true);
		});

		test('should construct filter type from both a schema property and a dictionary', () => {
			const schema = new Schema(
				{ stringProp: { type: 'string', path: '1' } },
				{ dictionaries: { stringDictionary: 'STRING_DICTIONARY' } },
			);
			const test1: Equals<
				Filter<typeof schema>,
				{
					$and?: Filter<typeof schema>[];
					$or?: Filter<typeof schema>[];
					stringProp?: Condition<string>;
					stringDictionary?: Condition<string>;
					_id?: Condition<string>;
				}
			> = true;
			expect(test1).toBe(true);
		});

		test('should construct filter type from all possible dictionary formats', () => {
			const schema = new Schema(
				{},
				{
					dictionaries: {
						stringDictionary: 'STRING_DICTIONARY',
						stringDictionaryExplicit: { type: 'string', dictionary: 'STRING_DICTIONARY_EXPLICIT' },
						numberDictionary: { type: 'number', dictionary: 'NUMBER_DICTIONARY' },
						booleanDictionary: { type: 'boolean', dictionary: 'BOOLEAN_DICTIONARY' },
						isoCalendarDateDictionary: {
							type: 'ISOCalendarDate',
							dictionary: 'ISO_CALENDAR_DATE_DICTIONARY',
						},
						isoTimeDictionary: { type: 'ISOTime', dictionary: 'ISO_TIME_DICTIONARY' },
						isoCalendarDateTimeDictionary: {
							type: 'ISOCalendarDateTime',
							dictionary: 'ISO_CALENDAR_DATE_TIME_DICTIONARY',
						},
					},
				},
			);
			const test1: Equals<
				Filter<typeof schema>,
				{
					$and?: Filter<typeof schema>[];
					$or?: Filter<typeof schema>[];
					stringDictionary?: Condition<string>;
					stringDictionaryExplicit?: Condition<string>;
					numberDictionary?: Condition<number>;
					booleanDictionary?: Condition<boolean>;
					isoCalendarDateDictionary?: Condition<ISOCalendarDate>;
					isoTimeDictionary?: Condition<ISOTime>;
					isoCalendarDateTimeDictionary?: Condition<ISOCalendarDateTime>;
					_id?: Condition<string>;
				}
			> = true;
			expect(test1).toBe(true);
		});

		test('should construct filter type from mixed schema', () => {
			const schema = new Schema(
				{
					booleanOptional: { type: 'boolean', path: '1' },
					booleanRequired: { type: 'boolean', path: '2', required: true },
					stringOptional: { type: 'string', path: '3' },
					stringRequired: { type: 'string', path: '4', required: true },
					numberOptional: { type: 'number', path: '5' },
					numberRequired: { type: 'number', path: '6', required: true },
					isoCalendarDateOptional: { type: 'ISOCalendarDate', path: '7' },
					isoCalendarDateRequired: { type: 'ISOCalendarDate', path: '8', required: true },
					isoTimeOptional: { type: 'ISOTime', path: '9' },
					isoTimeRequired: { type: 'ISOTime', path: '10', required: true },
					isoCalendarDateTimeOptional: { type: 'ISOCalendarDateTime', path: '11' },
					isoCalendarDateTimeRequired: { type: 'ISOCalendarDateTime', path: '12', required: true },
					arrayOptional: [{ type: 'string', path: '13' }],
					arrayRequired: [{ type: 'string', path: '14', required: true }],
					nestedArrayOptional: [[{ type: 'string', path: '15' }]],
					nestedArrayRequired: [[{ type: 'string', path: '16', required: true }]],
					embeddedOptional: new Schema({
						innerEmbeddedProp: { type: 'string', path: '17' },
					}),
					embeddedRequired: new Schema({
						innerEmbeddedProp: { type: 'string', path: '18', required: true },
					}),
					documentArrayOptional: [
						{
							docStringProp: { type: 'string', path: '19' },
							docNumberProp: { type: 'number', path: '20' },
						},
					],
					documentArrayRequired: [
						{
							docStringProp: { type: 'string', path: '21', required: true },
							docNumberProp: { type: 'number', path: '22' },
						},
					],
					documentArraySchemaOptional: [
						new Schema({
							docStringProp: { type: 'string', path: '23' },
						}),
					],
					documentArraySchemaRequired: [
						new Schema({
							docStringProp: { type: 'string', path: '24', required: true },
						}),
					],
				},
				{
					dictionaries: {
						stringDictionary: 'STRING_DICTIONARY',
						stringDictionaryExplicit: { type: 'string', dictionary: 'STRING_DICTIONARY_EXPLICIT' },
						numberDictionary: { type: 'number', dictionary: 'NUMBER_DICTIONARY' },
						booleanDictionary: { type: 'boolean', dictionary: 'BOOLEAN_DICTIONARY' },
						isoCalendarDateDictionary: {
							type: 'ISOCalendarDate',
							dictionary: 'ISO_CALENDAR_DATE_DICTIONARY',
						},
						isoTimeDictionary: { type: 'ISOTime', dictionary: 'ISO_TIME_DICTIONARY' },
						isoCalendarDateTimeDictionary: {
							type: 'ISOCalendarDateTime',
							dictionary: 'ISO_CALENDAR_DATE_TIME_DICTIONARY',
						},
					},
				},
			);

			const test1: Equals<
				Filter<typeof schema>,
				{
					$and?: Filter<typeof schema>[];
					$or?: Filter<typeof schema>[];
					booleanOptional?: Condition<boolean>;
					booleanRequired?: Condition<boolean>;
					stringOptional?: Condition<string>;
					stringRequired?: Condition<string>;
					numberOptional?: Condition<number>;
					numberRequired?: Condition<number>;
					isoCalendarDateOptional?: Condition<ISOCalendarDate>;
					isoCalendarDateRequired?: Condition<ISOCalendarDate>;
					isoTimeOptional?: Condition<ISOTime>;
					isoTimeRequired?: Condition<ISOTime>;
					isoCalendarDateTimeOptional?: Condition<ISOCalendarDateTime>;
					isoCalendarDateTimeRequired?: Condition<ISOCalendarDateTime>;
					arrayOptional?: Condition<string>;
					arrayRequired?: Condition<string>;
					nestedArrayOptional?: Condition<string>;
					nestedArrayRequired?: Condition<string>;
					'embeddedOptional.innerEmbeddedProp'?: Condition<string>;
					'embeddedRequired.innerEmbeddedProp'?: Condition<string>;
					'documentArrayOptional.docStringProp'?: Condition<string>;
					'documentArrayOptional.docNumberProp'?: Condition<number>;
					'documentArrayRequired.docStringProp'?: Condition<string>;
					'documentArrayRequired.docNumberProp'?: Condition<number>;
					'documentArraySchemaOptional.docStringProp'?: Condition<string>;
					'documentArraySchemaRequired.docStringProp'?: Condition<string>;
					stringDictionary?: Condition<string>;
					stringDictionaryExplicit?: Condition<string>;
					numberDictionary?: Condition<number>;
					booleanDictionary?: Condition<boolean>;
					isoCalendarDateDictionary?: Condition<ISOCalendarDate>;
					isoTimeDictionary?: Condition<ISOTime>;
					isoCalendarDateTimeDictionary?: Condition<ISOCalendarDateTime>;
					_id?: Condition<string>;
				}
			> = true;
			expect(test1).toBe(true);
		});
	});
});
