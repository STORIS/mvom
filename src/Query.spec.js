/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
import { mockLogger } from '#test/helpers';
import Query from './Query';

describe('Query', () => {
	describe('constructor', () => {
		test('should set the instance members to their default values', () => {
			const query = new Query('foo');
			expect(query._Model).toBe('foo');
			expect(query._limit).toBeNull();
			expect(query._selectionCriteria).toBeNull();
			expect(query._skip).toBe(0);
			expect(query._sortCriteria).toBeNull();
		});
	});

	describe('instance methods', () => {
		const executeDbFeature = stub();
		const makeModelFromDbResult = stub();
		const Model = class {
			static connection = { executeDbFeature, logger: mockLogger };

			static file = 'foo';

			static makeModelFromDbResult = makeModelFromDbResult;
		};
		let query;
		beforeAll(() => {
			query = new Query(Model);
		});

		beforeEach(() => {
			executeDbFeature.reset();
			makeModelFromDbResult.resetHistory();
			query._Model.schema = 'initial';
			query._limit = null;
			query._selectionCriteria = null;
			query._skip = null;
			query._sortCriteria = null;
		});

		describe('exec', () => {
			describe('query options', () => {
				beforeEach(() => {
					executeDbFeature.resolves({ count: 0, documents: [] });
				});
				test('should set queryCommand without criteria if none specified', async () => {
					await query.exec();
					expect(executeDbFeature.args[0][1].queryCommand).toBe('select foo');
				});

				test('should set queryCommand with selection criteria if specified', async () => {
					query._selectionCriteria = 'bar';
					await query.exec();
					expect(executeDbFeature.args[0][1].queryCommand).toBe('select foo with bar');
				});

				test('should set queryCommand with sort criteria if specified', async () => {
					query._sortCriteria = 'baz';
					await query.exec();
					expect(executeDbFeature.args[0][1].queryCommand).toBe('select foo baz');
				});

				test('should set queryCommand with selection and sort criteria if specified', async () => {
					query._selectionCriteria = 'bar';
					query._sortCriteria = 'baz';
					await query.exec();
					expect(executeDbFeature.args[0][1].queryCommand).toBe('select foo with bar baz');
				});

				test("should set filename option based on Model's file", async () => {
					await query.exec();
					expect(executeDbFeature.args[0][1].filename).toBe('foo');
				});

				test('should set the skip option if specified', async () => {
					query._skip = 'foo';
					await query.exec();
					expect(executeDbFeature.args[0][1].skip).toBe('foo');
				});

				test('should set the limit option if specified', async () => {
					query._limit = 'foo';
					await query.exec();
					expect(executeDbFeature.args[0][1].limit).toBe('foo');
				});
			});

			test('should call makeModelFromDbResult for each result', async () => {
				executeDbFeature.resolves({ count: 10, documents: ['foo', 'bar'] });
				await query.exec();
				expect(makeModelFromDbResult.calledTwice).toBe(true);
				expect(makeModelFromDbResult.calledWith('foo')).toBe(true);
				expect(makeModelFromDbResult.calledWith('bar')).toBe(true);
			});

			test('should return an object containing an array with length equal to the number of results', async () => {
				executeDbFeature.resolves({ count: 2, documents: ['foo', 'bar'] });
				const results = await query.exec();
				expect(typeof results).toBe('object');
				expect(results.documents.length).toBe(2);
			});

			test('should return an object with a count property equal to the total number of items that matched the query', async () => {
				executeDbFeature.resolves({ count: 5, documents: ['foo', 'bar'] });
				const results = await query.exec();
				expect(typeof results).toBe('object');
				expect(results.count).toBe(5);
			});
		});

		describe('limit', () => {
			test('should throw is parameter is a non-integer', () => {
				expect(query.limit.bind(query, 'foo')).toThrow();
			});

			test('should set the instance limit value to null if no parameter is passed', () => {
				query.limit();
				expect(query._limit).toBeNull();
			});

			test('should set the instance limit value to the passed parameter', () => {
				query.limit(1337);
				expect(query._limit).toBe(1337);
			});
		});

		describe('selection', () => {
			beforeAll(() => {
				stub(query, '_formatSelectionCriteria').returns('foo');
			});

			afterAll(() => {
				query._formatSelectionCriteria.restore();
			});

			test('should call _formatSelectionCriteria with the passed criteria parameter', () => {
				query.selection('foo');
				expect(query._formatSelectionCriteria.calledWith('foo')).toBe(true);
			});

			test('should set the instance _selectionCriteria to the value returned from _formatSelectionCriteria', () => {
				query.selection();
				expect(query._selectionCriteria).toBe('foo');
			});
		});

		describe('skip', () => {
			test('should throw is parameter is a non-integer', () => {
				expect(query.skip.bind(query, 'foo')).toThrow();
			});

			test('should set the instance skip value to 0 if no parameter is passed', () => {
				query.skip();
				expect(query._skip).toBe(0);
			});

			test('should set the instance skip value to the passed parameter', () => {
				query.skip(1337);
				expect(query._skip).toBe(1337);
			});
		});

		describe('sort', () => {
			beforeAll(() => {
				stub(query, '_formatSortCriteria').returns('foo');
			});

			afterAll(() => {
				query._formatSortCriteria.restore();
			});

			test('should call _formatSortCriteria with the passed criteria parameter', () => {
				query.sort('foo');
				expect(query._formatSortCriteria.calledWith('foo')).toBe(true);
			});

			test('should set the instance _sortCriteria to the value returned from _formatSortCriteria', () => {
				query.sort();
				expect(query._sortCriteria).toBe('foo');
			});
		});

		describe('_formatCondition', () => {
			beforeAll(() => {
				stub(query, '_formatConstant').returnsArg(1);
				stub(query, '_getDictionaryId').returnsArg(0);
			});

			afterAll(() => {
				query._formatConstant.restore();
				query._getDictionaryId.restore();
			});

			test('should return a query conditional expression', () => {
				expect(query._formatCondition('foo', 'bar', 'baz')).toBe('foo bar baz');
			});
		});

		describe('_formatConditionList', () => {
			beforeAll(() => {
				stub(query, '_formatCondition').returnsArg(2);
			});

			afterAll(() => {
				query._formatCondition.restore();
			});

			test('should throw if valueList parameter is not an array', () => {
				expect(() => {
					query._formatConditionList('foo', 'bar', 'baz', 'qux');
				}).toThrow();
			});

			test('should return an unjoined query conditional expression', () => {
				expect(query._formatConditionList('foo', 'bar', ['baz'], 'corge')).toBe('baz');
			});

			test('should returned a joined list of query conditional expressions', () => {
				expect(query._formatConditionList('foo', 'bar', ['baz', 'qux', 'quux'], 'corge')).toBe(
					'(baz corge qux corge quux)',
				);
			});
		});

		describe('_formatConstant', () => {
			const queryTransformer = stub().returnsArg(0);
			beforeAll(() => {
				stub(query, '_getQueryTransformer');
			});

			beforeEach(() => {
				query._getQueryTransformer.returns(queryTransformer);
				queryTransformer.resetHistory();
			});

			afterAll(() => {
				query._getQueryTransformer.restore();
			});

			test('should throw if constant parameter contains both single and double quotes', () => {
				expect(() => {
					query._formatConstant({}, `'"`);
				}).toThrow();
			});

			test('should return a string enclosed in single quotes if string parameter contains a double quote', () => {
				expect(query._formatConstant({}, `"foo`)).toBe(`'"foo'`);
			});

			test('should return a string enclosed in double quotes if string parameter contains a single quote', () => {
				expect(query._formatConstant({}, `'foo`)).toBe(`"'foo"`);
			});

			test("should return a string enclosed in double quotes if string parameter doesn't contain any quotes", () => {
				expect(query._formatConstant({}, `foo`)).toBe(`"foo"`);
			});

			test('should call queryTransformer if one is defined', () => {
				query._formatConstant({}, `foo`);
				expect(queryTransformer.calledOnce).toBe(true);
			});

			test('should call queryTransformer if one is not defined', () => {
				query._getQueryTransformer.returns();
				query._formatConstant({}, `foo`);
				expect(queryTransformer.notCalled).toBe(true);
			});
		});

		describe('_formatSelectionCriteria', () => {
			beforeAll(() => {
				stub(query, '_formatCondition').returns('formatConditionResult');
				stub(query, '_formatConditionList').returns('formatConditionListResult');
			});

			afterAll(() => {
				query._formatCondition.restore();
				query._formatConditionList.restore();
			});

			beforeEach(() => {
				query._formatCondition.resetHistory();
				query._formatConditionList.resetHistory();
			});

			test('should return null if no parameter passed', () => {
				expect(query._formatSelectionCriteria()).toBeNull();
			});

			test('should call formatConditionList with = condition and "or" joiner when property is an array', () => {
				query._formatSelectionCriteria({ def: ['henk', 'mos'] });
				expect(query._formatConditionList.calledWith('def', '=', ['henk', 'mos'], 'or')).toBe(true);
			});

			test('should call formatCondition with equality condition when property is a non-object', () => {
				query._formatSelectionCriteria({ def: 'henk' });
				expect(query._formatCondition.calledWith('def', '=', 'henk')).toBe(true);
			});

			test('should call formatCondition with equality condition when property is an object with a $eq property', () => {
				query._formatSelectionCriteria({ def: { $eq: 'henk' } });
				expect(query._formatCondition.calledWith('def', '=', 'henk')).toBe(true);
			});

			test('should call formatCondition with > condition when property is an object with a $gt property', () => {
				query._formatSelectionCriteria({ def: { $gt: 'henk' } });
				expect(query._formatCondition.calledWith('def', '>', 'henk')).toBe(true);
			});

			test('should call formatCondition with >= condition when property is an object with a $gte property', () => {
				query._formatSelectionCriteria({ def: { $gte: 'henk' } });
				expect(query._formatCondition.calledWith('def', '>=', 'henk')).toBe(true);
			});

			test('should call formatCondition with < condition when property is an object with a $lt property', () => {
				query._formatSelectionCriteria({ def: { $lt: 'henk' } });
				expect(query._formatCondition.calledWith('def', '<', 'henk')).toBe(true);
			});

			test('should call formatCondition with <= condition when property is an object with a $lte property', () => {
				query._formatSelectionCriteria({ def: { $lte: 'henk' } });
				expect(query._formatCondition.calledWith('def', '<=', 'henk')).toBe(true);
			});

			test('should call formatCondition with # condition when property is an object with a $ne property', () => {
				query._formatSelectionCriteria({ def: { $ne: 'henk' } });
				expect(query._formatCondition.calledWith('def', '#', 'henk')).toBe(true);
			});

			test('should call formatCondition with like condition and wildcarded on both sides when property is an object with a $contains property', () => {
				query._formatSelectionCriteria({ def: { $contains: 'henk' } });
				expect(query._formatCondition.calledWith('def', 'like', '...henk...')).toBe(true);
			});

			test('should call formatCondition with like condition and wildcarded tail when property is an object with a $startsWith property', () => {
				query._formatSelectionCriteria({ def: { $startsWith: 'henk' } });
				expect(query._formatCondition.calledWith('def', 'like', 'henk...')).toBe(true);
			});

			test('should call formatCondition with like condition and wildcarded prefix when property is an object with a $endsWith property', () => {
				query._formatSelectionCriteria({ def: { $endsWith: 'henk' } });
				expect(query._formatCondition.calledWith('def', 'like', '...henk')).toBe(true);
			});

			test('should call formatConditionList with = condition and "or" joiner when property is an object with a $in property', () => {
				query._formatSelectionCriteria({ def: { $in: ['henk', 'mos'] } });
				expect(query._formatConditionList.calledWith('def', '=', ['henk', 'mos'], 'or')).toBe(true);
			});

			test('should call formatConditionList with # condition and "and" joiner when property is an object with a $nin property', () => {
				query._formatSelectionCriteria({ def: { $nin: ['henk', 'mos'] } });
				expect(query._formatConditionList.calledWith('def', '#', ['henk', 'mos'], 'and')).toBe(
					true,
				);
			});

			test('should throw if property contains an unknown operator', () => {
				expect(query._formatSelectionCriteria.bind(query, { def: { foo: 'bar' } })).toThrow();
			});

			test('should return a a single condition string', () => {
				expect(query._formatSelectionCriteria({ def: 'foo' })).toBe('formatConditionResult');
			});

			test('should return a a condition string joined by and', () => {
				expect(query._formatSelectionCriteria({ def: 'foo', henk: 'foo' })).toBe(
					'(formatConditionResult and formatConditionResult)',
				);
			});

			test('should return a condition string joined by or', () => {
				expect(query._formatSelectionCriteria({ $or: [{ def: 'foo' }, { henk: 'foo' }] })).toBe(
					'(formatConditionResult or formatConditionResult)',
				);
			});

			test('should return a single condition when $or is used with one condition', () => {
				expect(query._formatSelectionCriteria({ $or: [{ def: 'foo' }] })).toBe(
					'formatConditionResult',
				);
			});

			test('should return a condition string joined by "and" and a condition string joined by or', () => {
				expect(
					query._formatSelectionCriteria({
						$or: [{ def: 'foo', henk: 'foo' }, { mos: 'foo' }],
					}),
				).toBe('((formatConditionResult and formatConditionResult) or formatConditionResult)');
			});

			test('should return an outer "and" condition string and an inner "or" condition string', () => {
				expect(
					query._formatSelectionCriteria({
						def: 'foo',
						henk: 'foo',
						$or: [{ mos: 'foo', thud: 'foo' }, { plugh: 'foo' }],
					}),
				).toBe(
					'(formatConditionResult and formatConditionResult and ((formatConditionResult and formatConditionResult) or formatConditionResult))',
				);
			});

			test('should return an "and" condition string with multiple operators on one property', () => {
				expect(query._formatSelectionCriteria({ def: { $lt: 'foo', $gt: 'foo' } })).toBe(
					'(formatConditionResult and formatConditionResult)',
				);
			});

			test('should return multiple "and" conditions string with multiple operators on two property', () => {
				expect(
					query._formatSelectionCriteria({
						def: { $lt: 'foo', $gt: 'foo' },
						henk: { $lt: 'foo', $gt: 'foo' },
					}),
				).toBe(
					'((formatConditionResult and formatConditionResult) and (formatConditionResult and formatConditionResult))',
				);
			});

			test('should throw if $or property value is a non-array', () => {
				expect(query._formatSelectionCriteria.bind(query, { $or: 'foo' })).toThrow();
			});

			test('should throw if $or property value is an empty array', () => {
				expect(query._formatSelectionCriteria.bind(query, { $or: [] })).toThrow();
			});
		});

		describe('_formatSortCriteria', () => {
			beforeAll(() => {
				stub(query, '_getDictionaryId').returnsArg(0);
			});

			afterAll(() => {
				query._getDictionaryId.restore();
			});

			test('should return null if no parameter is passed', () => {
				expect(query._formatSortCriteria()).toBeNull();
			});

			test('should return an ascending sort criteria if no sort direction is passed in', () => {
				expect(query._formatSortCriteria(['foo', 'bar'])).toBe('by foo by bar');
			});

			test('should return an ascending sort criteria', () => {
				expect(query._formatSortCriteria([['foo', 1]])).toBe('by foo');
			});

			test('should return a descending sort criteria', () => {
				expect(query._formatSortCriteria([['foo', -1]])).toBe('by.dsnd foo');
			});

			test('should return multiple space-delimited sort criteria', () => {
				expect(query._formatSortCriteria([['foo', 1], ['bar', -1]])).toBe('by foo by.dsnd bar');
			});
		});

		describe('_getDictionaryId', () => {
			test('should throw if no dictionary exists at the given path', () => {
				query._Model.schema = { dictPaths: {} };
				expect(query._getDictionaryId.bind(query, 'foo')).toThrow();
			});

			test('should return the dictionary value at the given path', () => {
				query._Model.schema = { dictPaths: { foo: 'bar' } };
				expect(query._getDictionaryId('foo')).toBe('bar');
			});
		});

		describe('_getQueryTransformer', () => {
			test('should return undefined if no schema type is present at the given path', () => {
				query._Model.schema = { paths: {} };
				expect(query._getQueryTransformer('foo')).not.toBeDefined();
			});

			test('should return the transformToQuery property', () => {
				query._Model.schema = { paths: { foo: { transformToQuery: 'bar' } } };
				expect(query._getQueryTransformer('foo')).toBe('bar');
			});
		});

		describe('_setOptions', () => {
			beforeAll(() => {
				stub(query, 'limit');
				stub(query, 'skip');
				stub(query, 'sort');
			});

			afterAll(() => {
				query.limit.restore();
				query.skip.restore();
				query.sort.restore();
			});

			beforeEach(() => {
				query.limit.resetHistory();
				query.skip.resetHistory();
				query.sort.resetHistory();
			});

			test('should call limit with the passed limit property', () => {
				query._setOptions({ limit: 'foo' });
				expect(query.limit.calledWith('foo')).toBe(true);
			});

			test('should call skip with the passed skip property', () => {
				query._setOptions({ skip: 'foo' });
				expect(query.skip.calledWith('foo')).toBe(true);
			});

			test('should call sort with the passed sort property', () => {
				query._setOptions({ sort: 'foo' });
				expect(query.sort.calledWith('foo')).toBe(true);
			});

			test('should call each option setter with undefined when no parameter passed', () => {
				query._setOptions();
				expect(query.limit.calledWith(undefined)).toBe(true);
				expect(query.skip.calledWith(undefined)).toBe(true);
				expect(query.sort.calledWith(undefined)).toBe(true);
			});
		});
	});
});
