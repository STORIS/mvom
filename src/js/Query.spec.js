import { InvalidParameterError } from '#shared/errors';
import Query from './Query';

describe('Query', () => {
	const executeDbFeature = jest.fn();
	const logger = { debug: jest.fn() };
	const makeModelFromDbResult = jest.fn();
	const schema = {
		dictPaths: { foo: 'FOO', bar: 'BAR', baz: 'BAZ' },
		paths: { bar: { transformToQuery: (value) => `TRANSFORMED_${value}` } },
	};
	const Model = class {
		static connection = { executeDbFeature, logger };

		static file = 'FILE';

		static makeModelFromDbResult = makeModelFromDbResult;

		static schema = schema;
	};
	const data = { count: 3, documents: [{ _id: '1' }, { _id: '2' }, { _id: '3' }] };

	beforeEach(() => {
		executeDbFeature.mockResolvedValue(data);
		makeModelFromDbResult.mockImplementation((args) => args);
	});

	describe('exec', () => {
		test('should not apply any selection, sort, limit, or skip criteria provided none', async () => {
			const query = new Query(Model);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE',
				skip: 0,
			});
		});

		test('should apply all selection, sort, limit, and skip criteria if provided', async () => {
			const selection = { foo: 'FOO_VALUE' };
			const options = { sort: ['foo'], skip: 10, limit: 10 };
			const query = new Query(Model, selection, options);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(
				1,
				'executing query "select FILE with FOO = "FOO_VALUE" by FOO"',
			);
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE with FOO = "FOO_VALUE" by FOO',
				skip: 10,
				limit: 10,
			});
		});
	});

	describe('sort', () => {
		test('should throw InvalidParameterError when the provided sort criteria does not exists in the dictionary', async () => {
			const sort = ['invalid'];
			const query = new Query(Model);

			expect(() => query.sort(sort)).toThrow(InvalidParameterError);
			expect(logger.debug).not.toHaveBeenCalled();
			expect(executeDbFeature).not.toHaveBeenCalled();
		});

		test('should construct a sorted query command provided sort criteria', async () => {
			const sort = ['foo'];
			const query = new Query(Model);
			query.sort(sort);

			expect(await query.exec(sort)).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE by FOO"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE by FOO',
				skip: 0,
			});
		});

		test('should sort by an attribute descending when provided descending sort criteria', async () => {
			const sort = [['foo', -1]];
			const query = new Query(Model);
			query.sort(sort);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE by.dsnd FOO"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE by.dsnd FOO',
				skip: 0,
			});
		});

		test('should sort by multiple properties when provided an array of sort criteria', async () => {
			const sort = [['foo', -1], ['bar', 1], 'baz'];
			const query = new Query(Model);
			query.sort(sort);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(
				1,
				'executing query "select FILE by.dsnd FOO by BAR by BAZ"',
			);
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE by.dsnd FOO by BAR by BAZ',
				skip: 0,
			});
		});
	});

	describe('skip', () => {
		test('should throw InvalidParameterError when the provided skip number is not an integer', async () => {
			const query = new Query(Model);

			expect(() => query.skip(0.5)).toThrow(InvalidParameterError);
			expect(logger.debug).not.toHaveBeenCalled();
			expect(executeDbFeature).not.toHaveBeenCalled();
		});

		test('should skip by the provided skip integer', async () => {
			const query = new Query(Model);
			query.skip(10);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE',
				skip: 10,
			});
		});
	});

	describe('limit', () => {
		test('should throw InvalidParameterError when the provided limit number is not an integer', async () => {
			const query = new Query(Model);

			expect(() => query.limit(0.5)).toThrow(InvalidParameterError);
			expect(logger.debug).not.toHaveBeenCalled();
			expect(executeDbFeature).not.toHaveBeenCalled();
		});

		test('should limit by the provided limit integer', async () => {
			const query = new Query(Model);
			query.limit(10);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE',
				limit: 10,
				skip: 0,
			});
		});

		test('should limit by null if null is the provided limit', async () => {
			const query = new Query(Model);
			query.limit(null);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(1, 'executing query "select FILE"');
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE',
				limit: undefined,
				skip: 0,
			});
		});
	});

	describe('selection', () => {
		test('should construct a selection query using the $eq operator if the provided selection criteria is a plain object', async () => {
			const selectionCriteria = { foo: 'FOO_VALUE' };
			const query = new Query(Model);
			query.selection(selectionCriteria);

			expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
			expect(logger.debug).toHaveBeenCalledTimes(1);
			expect(logger.debug).toHaveBeenNthCalledWith(
				1,
				'executing query "select FILE with FOO = "FOO_VALUE""',
			);
			expect(executeDbFeature).toHaveBeenCalledTimes(1);
			expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
				filename: 'FILE',
				queryCommand: 'select FILE with FOO = "FOO_VALUE"',
				skip: 0,
			});
		});

		describe('query value array', () => {
			test('should construct a selection query using the $in operator if the provided selection criteria is an array', async () => {
				const selectionCriteria = { foo: ['FOO1_VALUE', 'FOO2_VALUE'] };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")"',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")',
					skip: 0,
				});
			});

			test('should construct query with the first array element if the array only contains one element', async () => {
				const selectionCriteria = { foo: ['FOO1_VALUE'] };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO = "FOO1_VALUE""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO = "FOO1_VALUE"',
					skip: 0,
				});
			});

			test('should throw a InvalidParameterError if the query value array is empty', () => {
				const selectionCriteria = { foo: [] };
				const query = new Query(Model);

				expect(() => query.selection(selectionCriteria)).toThrow(InvalidParameterError);
				expect(logger.debug).not.toHaveBeenCalled();
				expect(executeDbFeature).not.toHaveBeenCalled();
			});
		});

		describe('formatting', () => {
			test('should format the query value using queryTransformer if there is one', async () => {
				const selectionCriteria = { bar: { $eq: 'BAR_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with BAR = "TRANSFORMED_BAR_VALUE""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with BAR = "TRANSFORMED_BAR_VALUE"',
					skip: 0,
				});
			});

			test('should format the query value to surround it using single quotes if it contains double quotes', async () => {
				const selectionCriteria = { foo: { $eq: 'CONTAINS "DOUBLE" QUOTES"' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					`executing query "select FILE with FOO = 'CONTAINS "DOUBLE" QUOTES"'"`,
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: `select FILE with FOO = 'CONTAINS "DOUBLE" QUOTES"'`,
					skip: 0,
				});
			});

			test('should format the query value to surround it using double quotes if it contains single quotes', async () => {
				const selectionCriteria = { foo: { $eq: "CONTAINS 'SINGLE' QUOTES" } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					`executing query "select FILE with FOO = "CONTAINS 'SINGLE' QUOTES""`,
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: `select FILE with FOO = "CONTAINS 'SINGLE' QUOTES"`,
					skip: 0,
				});
			});

			test('should throw an Error for query value containing single and double quotes', async () => {
				const selectionCriteria = { foo: `'SINGLE' AND "DOUBLE" QUOTES` };
				const query = new Query(Model);

				expect(() => query.selection(selectionCriteria)).toThrow(Error);
				expect(logger.debug).not.toHaveBeenCalled();
				expect(executeDbFeature).not.toHaveBeenCalled();
			});
		});

		describe('operators', () => {
			test('should format the $eq operator', async () => {
				const selectionCriteria = { foo: { $eq: 'FOO_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO = "FOO_VALUE""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO = "FOO_VALUE"',
					skip: 0,
				});
			});

			test('should format the $gt operator', async () => {
				const selectionCriteria = { foo: { $gt: '10' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO > "10""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO > "10"',
					skip: 0,
				});
			});

			test('should format the $gte operator', async () => {
				const selectionCriteria = { foo: { $gte: '10' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO >= "10""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO >= "10"',
					skip: 0,
				});
			});

			test('should format the $lt operator', async () => {
				const selectionCriteria = { foo: { $lt: '10' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO < "10""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO < "10"',
					skip: 0,
				});
			});

			test('should format the $lte operator', async () => {
				const selectionCriteria = { foo: { $lte: '10' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO <= "10""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO <= "10"',
					skip: 0,
				});
			});

			test('should format the $ne operator', async () => {
				const selectionCriteria = { foo: { $ne: 'BAR_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO # "BAR_VALUE""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO # "BAR_VALUE"',
					skip: 0,
				});
			});

			test('should format the $contains operator', async () => {
				const selectionCriteria = { foo: { $contains: 'FOO_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO like "...FOO_VALUE...""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO like "...FOO_VALUE..."',
					skip: 0,
				});
			});

			test('should format the $startsWith operator', async () => {
				const selectionCriteria = { foo: { $startsWith: 'FOO_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO like "FOO_VALUE...""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO like "FOO_VALUE..."',
					skip: 0,
				});
			});

			test('should format the $endsWith operator', async () => {
				const selectionCriteria = { foo: { $endsWith: 'FOO_VALUE' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with FOO like "...FOO_VALUE""',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with FOO like "...FOO_VALUE"',
					skip: 0,
				});
			});

			test('should format the $in operator', async () => {
				const selectionCriteria = { foo: { $in: ['FOO1_VALUE', 'FOO2_VALUE'] } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")"',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")',
					skip: 0,
				});
			});

			test('should format the $nin operator', async () => {
				const selectionCriteria = { foo: { $nin: ['BAR1_VALUE', 'BAR2_VALUE'] } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					'executing query "select FILE with (FOO # "BAR1_VALUE" and FOO # "BAR2_VALUE")"',
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: 'select FILE with (FOO # "BAR1_VALUE" and FOO # "BAR2_VALUE")',
					skip: 0,
				});
			});

			test('should throw a TypeError for an operator that is not supported', async () => {
				const selectionCriteria = { foo: { $notSupportedOperator: 'INVALID' } };
				const query = new Query(Model);

				expect(() => query.selection(selectionCriteria)).toThrow(TypeError);
				expect(logger.debug).not.toHaveBeenCalled();
				expect(executeDbFeature).not.toHaveBeenCalled();
			});
		});

		describe('multiple conditions', () => {
			test('should combine multiple conditions with "and" if there is more than one condition for the same property', async () => {
				const selectionCriteria = { foo: { $lte: '100', $gte: '0', $contains: '5' } };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					`executing query "select FILE with (FOO <= "100" and FOO >= "0" and FOO like "...5...")"`,
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: `select FILE with (FOO <= "100" and FOO >= "0" and FOO like "...5...")`,
					skip: 0,
				});
			});

			test('should combine multiple conditions with "and" if there is more than one condition for different properties', async () => {
				const selectionCriteria = { foo: 'FOO_VALUE', bar: 'BAR_VALUE', baz: 'BAZ_VALUE' };
				const query = new Query(Model);
				query.selection(selectionCriteria);

				expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
				expect(logger.debug).toHaveBeenCalledTimes(1);
				expect(logger.debug).toHaveBeenNthCalledWith(
					1,
					`executing query "select FILE with (FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE" and BAZ = "BAZ_VALUE")"`,
				);
				expect(executeDbFeature).toHaveBeenCalledTimes(1);
				expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
					filename: 'FILE',
					queryCommand: `select FILE with (FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE" and BAZ = "BAZ_VALUE")`,
					skip: 0,
				});
			});

			describe('$and', () => {
				test('should construct a query combining multiple conditions joined by and', async () => {
					const selectionCriteria = { $and: [{ foo: 'FOO_VALUE' }, { baz: 'BAZ_VALUE' }] };
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with (FOO = "FOO_VALUE" and BAZ = "BAZ_VALUE")"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with (FOO = "FOO_VALUE" and BAZ = "BAZ_VALUE")`,
						skip: 0,
					});
				});

				test('should construct query using a single condition when $and only contains one condition in the query value array', async () => {
					const selectionCriteria = { $and: [{ foo: 'FOO_VALUE' }] };
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with FOO = "FOO_VALUE""`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with FOO = "FOO_VALUE"`,
						skip: 0,
					});
				});

				test('should construct query with multiple condition strings joined by "and" if one condition has multiple properties', async () => {
					const selectionCriteria = {
						$and: [{ foo: 'FOO_VALUE', bar: 'BAR_VALUE' }, { baz: 'BAZ_VALUE' }],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") and BAZ = "BAZ_VALUE")"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") and BAZ = "BAZ_VALUE")`,
						skip: 0,
					});
				});

				test('should construct query with an an outer "and" condition string and an inner "and" condition string', async () => {
					const selectionCriteria = {
						foo: 'FOO_VALUE',
						baz: 'BAZ_VALUE',
						$and: [
							{ foo: { $startsWith: 'FOO_VALUE' }, baz: { $endsWith: 'BAZ_VALUE' } },
							{ bar: 'BAR_VALUE' },
						],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with (FOO = "FOO_VALUE" and BAZ = "BAZ_VALUE" and ((FOO like "FOO_VALUE..." and BAZ like "...BAZ_VALUE") and BAR = "TRANSFORMED_BAR_VALUE"))"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with (FOO = "FOO_VALUE" and BAZ = "BAZ_VALUE" and ((FOO like "FOO_VALUE..." and BAZ like "...BAZ_VALUE") and BAR = "TRANSFORMED_BAR_VALUE"))`,
						skip: 0,
					});
				});

				test('should construct query with an inner "or" conditions and add them to the outer "and" condition', async () => {
					const selectionCriteria = {
						bar: 'BAR_VALUE',
						baz: 'BAZ_VALUE',
						$and: [{ $or: [{ foo: 'FOO1_VALUE' }, { foo: 'FOO2_VALUE' }] }],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with (BAR = "TRANSFORMED_BAR_VALUE" and BAZ = "BAZ_VALUE" and (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE"))"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with (BAR = "TRANSFORMED_BAR_VALUE" and BAZ = "BAZ_VALUE" and (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE"))`,
						skip: 0,
					});
				});

				test('should construct query with multiple inner "or" conditions and outer "and"', async () => {
					const selectionCriteria = {
						$and: [
							{ $or: [{ foo: 'FOO1_VALUE' }, { foo: 'FOO2_VALUE' }] },
							{ $or: [{ bar: 'BAR1_VALUE' }, { bar: 'BAR2_VALUE' }] },
							{ $or: [{ baz: 'BAZ1_VALUE' }, { baz: 'BAZ2_VALUE' }] },
						],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with ((FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE") and (BAR = "TRANSFORMED_BAR1_VALUE" or BAR = "TRANSFORMED_BAR2_VALUE") and (BAZ = "BAZ1_VALUE" or BAZ = "BAZ2_VALUE"))"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with ((FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE") and (BAR = "TRANSFORMED_BAR1_VALUE" or BAR = "TRANSFORMED_BAR2_VALUE") and (BAZ = "BAZ1_VALUE" or BAZ = "BAZ2_VALUE"))`,
						skip: 0,
					});
				});

				test('should throw a TypeError if $and property value is a non-array', () => {
					const selectionCriteria = { $and: 'NOT_VALID' };
					const query = new Query(Model);

					expect(() => query.selection(selectionCriteria)).toThrow(TypeError);
					expect(logger.debug).not.toHaveBeenCalled();
					expect(executeDbFeature).not.toHaveBeenCalled();
				});

				test('should throw a TypeError if $and property value is an empty array', () => {
					const selectionCriteria = { $and: [] };
					const query = new Query(Model);

					expect(() => query.selection(selectionCriteria)).toThrow(TypeError);
					expect(logger.debug).not.toHaveBeenCalled();
					expect(executeDbFeature).not.toHaveBeenCalled();
				});
			});

			describe('$or', () => {
				test('should construct query with a condition string joined by or', async () => {
					const selectionCriteria = {
						$or: [{ foo: 'FOO1_VALUE' }, { foo: 'FOO2_VALUE' }],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with (FOO = "FOO1_VALUE" or FOO = "FOO2_VALUE")`,
						skip: 0,
					});
				});

				test('should construct query with a single condition when $or is used with one condition', async () => {
					const selectionCriteria = { $or: [{ foo: 'FOO_VALUE' }] };
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with FOO = "FOO_VALUE""`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with FOO = "FOO_VALUE"`,
						skip: 0,
					});
				});

				test('should construct query with a condition string joined by "and" and a condition string joined by or', async () => {
					const selectionCriteria = {
						$or: [{ foo: 'FOO_VALUE', bar: 'BAR_VALUE' }, { baz: 'BAZ_VALUE' }],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") or BAZ = "BAZ_VALUE")"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") or BAZ = "BAZ_VALUE")`,
						skip: 0,
					});
				});

				test('should construct query with an outer "and" condition string and an inner "or" condition string', async () => {
					const selectionCriteria = {
						foo: { $startsWith: 'FOO_VALUE' },
						baz: { $startsWith: 'BAZ_VALUE' },
						$or: [{ foo: 'FOO_VALUE', bar: 'BAR_VALUE' }, { baz: 'BAZ_VALUE' }],
					};
					const query = new Query(Model);
					query.selection(selectionCriteria);

					expect(await query.exec()).toEqual({ count: data.count, documents: data.documents });
					expect(logger.debug).toHaveBeenCalledTimes(1);
					expect(logger.debug).toHaveBeenNthCalledWith(
						1,
						`executing query "select FILE with (FOO like "FOO_VALUE..." and BAZ like "BAZ_VALUE..." and ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") or BAZ = "BAZ_VALUE"))"`,
					);
					expect(executeDbFeature).toHaveBeenCalledTimes(1);
					expect(executeDbFeature).toHaveBeenNthCalledWith(1, 'find', {
						filename: 'FILE',
						queryCommand: `select FILE with (FOO like "FOO_VALUE..." and BAZ like "BAZ_VALUE..." and ((FOO = "FOO_VALUE" and BAR = "TRANSFORMED_BAR_VALUE") or BAZ = "BAZ_VALUE"))`,
						skip: 0,
					});
				});

				test('should throw a TypeError if $or property value is a non-array', () => {
					const selectionCriteria = { $or: 'NOT_VALID' };
					const query = new Query(Model);

					expect(() => query.selection(selectionCriteria)).toThrow(TypeError);
					expect(logger.debug).not.toHaveBeenCalled();
					expect(executeDbFeature).not.toHaveBeenCalled();
				});

				test('should throw a TypeError if $or property value is an empty array', () => {
					const selectionCriteria = { $or: [] };
					const query = new Query(Model);

					expect(() => query.selection(selectionCriteria)).toThrow(TypeError);
					expect(logger.debug).not.toHaveBeenCalled();
					expect(executeDbFeature).not.toHaveBeenCalled();
				});
			});
		});
	});
});
