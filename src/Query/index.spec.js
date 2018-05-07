/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import mockLogger from 'testHelpers/mockLogger';
import Query from './';

describe('Query', () => {
	describe('static methods', () => {
		describe('formatCondition', () => {
			before(() => {
				stub(Query, 'formatConstant').returnsArg(0);
			});

			after(() => {
				Query.formatConstant.restore();
			});

			it('should return a query conditional expression', () => {
				assert.strictEqual(Query.formatCondition('foo', 'bar', 'baz'), 'foo bar baz');
			});
		});

		describe('formatConditionList', () => {
			before(() => {
				stub(Query, 'formatCondition').returnsArg(2);
			});

			after(() => {
				Query.formatCondition.restore();
			});

			it('should throw if valueList parameter is not an array', () => {
				assert.throws(Query.formatConditionList.bind(Query, 'foo', 'bar', 'baz', 'qux'));
			});

			it('should return an unjoined query conditional expression', () => {
				assert.strictEqual(Query.formatConditionList('foo', 'bar', ['baz'], 'corge'), 'baz');
			});

			it('should returned a joined list of query conditional expressions', () => {
				assert.strictEqual(
					Query.formatConditionList('foo', 'bar', ['baz', 'qux', 'quux'], 'corge'),
					'(baz corge qux corge quux)',
				);
			});
		});

		describe('formatConstant', () => {
			it('should throw if constant parameter contains both single and double quotes', () => {
				assert.throws(Query.formatConstant.bind(Query, `'"`));
			});

			it('should return a string enclosed in single quotes if string parameter contains a double quote', () => {
				assert.strictEqual(Query.formatConstant(`"foo`), `'"foo'`);
			});

			it('should return a string enclosed in double quotes if string parameter contains a single quote', () => {
				assert.strictEqual(Query.formatConstant(`'foo`), `"'foo"`);
			});

			it("should return a string enclosed in double quotes if string parameter doesn't contain any quotes", () => {
				assert.strictEqual(Query.formatConstant(`foo`), `"foo"`);
			});
		});
	});

	describe('constructor', () => {
		it('should set the instance members to their default values', () => {
			const query = new Query('foo');
			assert.strictEqual(query._Model, 'foo');
			assert.isNull(query._limit);
			assert.isNull(query._selectionCriteria);
			assert.strictEqual(query._skip, 0);
			assert.isNull(query._sortCriteria);
		});
	});

	describe('instance methods', () => {
		const executeDbFeature = stub();
		const Model = class {
			static connection = { executeDbFeature, logger: mockLogger };
			static file = 'foo';
		};
		let query;
		before(() => {
			query = new Query(Model);
		});

		beforeEach(() => {
			executeDbFeature.reset();
			query._Model.schema = 'initial';
			query._limit = null;
			query._selectionCriteria = null;
			query._skip = null;
			query._sortCriteria = null;
		});

		describe('exec', () => {
			it('should set queryCommand without criteria if none specified', async () => {
				executeDbFeature.resolves({ result: [] });
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].queryCommand, 'select foo');
			});

			it('should set queryCommand with selection criteria if specified', async () => {
				executeDbFeature.resolves({ result: [] });
				query._selectionCriteria = 'bar';
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].queryCommand, 'select foo with bar');
			});

			it('should set queryCommand with sort criteria if specified', async () => {
				executeDbFeature.resolves({ result: [] });
				query._sortCriteria = 'baz';
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].queryCommand, 'select foo baz');
			});

			it('should set queryCommand with selection and sort criteria if specified', async () => {
				executeDbFeature.resolves({ result: [] });
				query._selectionCriteria = 'bar';
				query._sortCriteria = 'baz';
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].queryCommand, 'select foo with bar baz');
			});

			it("should set filename option based on Model's file", async () => {
				executeDbFeature.resolves({ result: [] });
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].filename, 'foo');
			});

			it('should set the skip option if specified', async () => {
				executeDbFeature.resolves({ result: [] });
				query._skip = 'foo';
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].skip, 'foo');
			});

			it('should set the limit option if specified', async () => {
				executeDbFeature.resolves({ result: [] });
				query._limit = 'foo';
				await query.exec();
				assert.strictEqual(executeDbFeature.args[0][1].limit, 'foo');
			});

			it('should return an array of Model instances', async () => {
				executeDbFeature.resolves({ result: [{}] });
				const results = await query.exec();
				assert.isArray(results);
				assert.instanceOf(results[0], Model);
			});
		});

		describe('limit', () => {
			it('should throw is parameter is a non-integer', () => {
				assert.throws(query.limit.bind(query, 'foo'));
			});

			it('should set the instance limit value to null if no parameter is passed', () => {
				query.limit();
				assert.isNull(query._limit);
			});

			it('should set the instance limit value to the passed parameter', () => {
				query.limit(1337);
				assert.strictEqual(query._limit, 1337);
			});
		});

		describe('selection', () => {
			before(() => {
				stub(query, '_formatSelectionCriteria').returns('foo');
			});

			after(() => {
				query._formatSelectionCriteria.restore();
			});

			it('should call _formatSelectionCriteria with the passed criteria parameter', () => {
				query.selection('foo');
				assert.isTrue(query._formatSelectionCriteria.calledWith('foo'));
			});

			it('should set the instance _selectionCriteria to the value returned from _formatSelectionCriteria', () => {
				query.selection();
				assert.strictEqual(query._selectionCriteria, 'foo');
			});
		});

		describe('skip', () => {
			it('should throw is parameter is a non-integer', () => {
				assert.throws(query.skip.bind(query, 'foo'));
			});

			it('should set the instance skip value to 0 if no parameter is passed', () => {
				query.skip();
				assert.strictEqual(query._skip, 0);
			});

			it('should set the instance skip value to the passed parameter', () => {
				query.skip(1337);
				assert.strictEqual(query._skip, 1337);
			});
		});

		describe('sort', () => {
			before(() => {
				stub(query, '_formatSortCriteria').returns('foo');
			});

			after(() => {
				query._formatSortCriteria.restore();
			});

			it('should call _formatSortCriteria with the passed criteria parameter', () => {
				query.sort('foo');
				assert.isTrue(query._formatSortCriteria.calledWith('foo'));
			});

			it('should set the instance _sortCriteria to the value returned from _formatSortCriteria', () => {
				query.sort();
				assert.strictEqual(query._sortCriteria, 'foo');
			});
		});

		describe('_formatSelectionCriteria', () => {
			before(() => {
				stub(Query, 'formatCondition').returns('formatConditionResult');
				stub(Query, 'formatConditionList').returns('formatConditionListResult');
				stub(query, '_getDictionaryId').returnsArg(0);
			});

			after(() => {
				Query.formatCondition.restore();
				Query.formatConditionList.restore();
				query._getDictionaryId.restore();
			});

			beforeEach(() => {
				Query.formatCondition.resetHistory();
				Query.formatConditionList.resetHistory();
			});

			it('should return null if no parameter passed', () => {
				assert.isNull(query._formatSelectionCriteria());
			});

			it('should call formatConditionList with = condition and "or" joiner when property is an array', () => {
				query._formatSelectionCriteria({ def: ['henk', 'mos'] });
				assert.isTrue(Query.formatConditionList.calledWith('def', '=', ['henk', 'mos'], 'or'));
			});

			it('should call formatCondition with equality condition when property is a non-object', () => {
				query._formatSelectionCriteria({ def: 'henk' });
				assert.isTrue(Query.formatCondition.calledWith('def', '=', 'henk'));
			});

			it('should call formatCondition with equality condition when property is an object with a $eq property', () => {
				query._formatSelectionCriteria({ def: { $eq: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '=', 'henk'));
			});

			it('should call formatCondition with > condition when property is an object with a $gt property', () => {
				query._formatSelectionCriteria({ def: { $gt: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '>', 'henk'));
			});

			it('should call formatCondition with >= condition when property is an object with a $gte property', () => {
				query._formatSelectionCriteria({ def: { $gte: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '>=', 'henk'));
			});

			it('should call formatCondition with < condition when property is an object with a $lt property', () => {
				query._formatSelectionCriteria({ def: { $lt: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '<', 'henk'));
			});

			it('should call formatCondition with <= condition when property is an object with a $lte property', () => {
				query._formatSelectionCriteria({ def: { $lte: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '<=', 'henk'));
			});

			it('should call formatCondition with # condition when property is an object with a $ne property', () => {
				query._formatSelectionCriteria({ def: { $ne: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', '#', 'henk'));
			});

			it('should call formatCondition with like condition and wildcarded on both sides when property is an object with a $contains property', () => {
				query._formatSelectionCriteria({ def: { $contains: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', 'like', '...henk...'));
			});

			it('should call formatCondition with like condition and wildcarded tail when property is an object with a $startsWith property', () => {
				query._formatSelectionCriteria({ def: { $startsWith: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', 'like', 'henk...'));
			});

			it('should call formatCondition with like condition and wildcarded prefix when property is an object with a $endsWith property', () => {
				query._formatSelectionCriteria({ def: { $endsWith: 'henk' } });
				assert.isTrue(Query.formatCondition.calledWith('def', 'like', '...henk'));
			});

			it('should call formatConditionList with = condition and "or" joiner when property is an object with a $in property', () => {
				query._formatSelectionCriteria({ def: { $in: ['henk', 'mos'] } });
				assert.isTrue(Query.formatConditionList.calledWith('def', '=', ['henk', 'mos'], 'or'));
			});

			it('should call formatConditionList with # condition and "and" joiner when property is an object with a $nin property', () => {
				query._formatSelectionCriteria({ def: { $nin: ['henk', 'mos'] } });
				assert.isTrue(Query.formatConditionList.calledWith('def', '#', ['henk', 'mos'], 'and'));
			});

			it('should throw if property contains an unknown operator', () => {
				assert.throws(query._formatSelectionCriteria.bind(query, { def: { foo: 'bar' } }));
			});

			it('should return a a single condition string', () => {
				assert.strictEqual(query._formatSelectionCriteria({ def: 'foo' }), 'formatConditionResult');
			});

			it('should return a a condition string joined by and', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({ def: 'foo', henk: 'foo' }),
					'(formatConditionResult and formatConditionResult)',
				);
			});

			it('should return a condition string joined by or', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({ $or: [{ def: 'foo' }, { henk: 'foo' }] }),
					'(formatConditionResult or formatConditionResult)',
				);
			});

			it('should return a single condition when $or is used with one condition', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({ $or: [{ def: 'foo' }] }),
					'formatConditionResult',
				);
			});

			it('should return a condition string joined by "and" and a condition string joined by or', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({
						$or: [{ def: 'foo', henk: 'foo' }, { mos: 'foo' }],
					}),
					'((formatConditionResult and formatConditionResult) or formatConditionResult)',
				);
			});

			it('should return an outer "and" condition string and an inner "or" condition string', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({
						def: 'foo',
						henk: 'foo',
						$or: [{ mos: 'foo', thud: 'foo' }, { plugh: 'foo' }],
					}),
					'(formatConditionResult and formatConditionResult and ((formatConditionResult and formatConditionResult) or formatConditionResult))',
				);
			});

			it('should return an "and" condition string with multiple operators on one property', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({ def: { $lt: 'foo', $gt: 'foo' } }),
					'(formatConditionResult and formatConditionResult)',
				);
			});

			it('should return multiple "and" conditions string with multiple operators on two property', () => {
				assert.strictEqual(
					query._formatSelectionCriteria({
						def: { $lt: 'foo', $gt: 'foo' },
						henk: { $lt: 'foo', $gt: 'foo' },
					}),
					'((formatConditionResult and formatConditionResult) and (formatConditionResult and formatConditionResult))',
				);
			});

			it('should throw if $or property value is a non-array', () => {
				assert.throws(query._formatSelectionCriteria.bind(query, { $or: 'foo' }));
			});

			it('should throw if $or property value is an empty array', () => {
				assert.throws(query._formatSelectionCriteria.bind(query, { $or: [] }));
			});
		});

		describe('_formatSortCriteria', () => {
			before(() => {
				stub(query, '_getDictionaryId').returnsArg(0);
			});

			after(() => {
				query._getDictionaryId.restore();
			});

			it('should return null if no parameter is passed', () => {
				assert.isNull(query._formatSortCriteria());
			});

			it('should return an ascending sort criteria if no sort direction is passed in', () => {
				assert.strictEqual(query._formatSortCriteria(['foo', 'bar']), 'by foo by bar');
			});

			it('should return an ascending sort criteria', () => {
				assert.strictEqual(query._formatSortCriteria([['foo', 1]]), 'by foo');
			});

			it('should return a descending sort criteria', () => {
				assert.strictEqual(query._formatSortCriteria([['foo', -1]]), 'by.dsnd foo');
			});

			it('should return multiple space-delimited sort criteria', () => {
				assert.strictEqual(
					query._formatSortCriteria([['foo', 1], ['bar', -1]]),
					'by foo by.dsnd bar',
				);
			});
		});

		describe('_getDictionaryId', () => {
			it('should throw if no dictionary exists at the given path', () => {
				query._Model.schema = { dictPaths: {} };
				assert.throws(query._getDictionaryId.bind(query, 'foo'));
			});

			it('should return the dictionary value at the given path', () => {
				query._Model.schema = { dictPaths: { foo: 'bar' } };
				assert.strictEqual(query._getDictionaryId('foo'), 'bar');
			});
		});

		describe('_setOptions', () => {
			before(() => {
				stub(query, 'limit');
				stub(query, 'skip');
				stub(query, 'sort');
			});

			after(() => {
				query.limit.restore();
				query.skip.restore();
				query.sort.restore();
			});

			beforeEach(() => {
				query.limit.resetHistory();
				query.skip.resetHistory();
				query.sort.resetHistory();
			});

			it('should call limit with the passed limit property', () => {
				query._setOptions({ limit: 'foo' });
				assert.isTrue(query.limit.calledWith('foo'));
			});

			it('should call skip with the passed skip property', () => {
				query._setOptions({ skip: 'foo' });
				assert.isTrue(query.skip.calledWith('foo'));
			});

			it('should call sort with the passed sort property', () => {
				query._setOptions({ sort: 'foo' });
				assert.isTrue(query.sort.calledWith('foo'));
			});

			it('should call each option setter with undefined when no parameter passed', () => {
				query._setOptions();
				assert.isTrue(query.limit.calledWith(undefined));
				assert.isTrue(query.skip.calledWith(undefined));
				assert.isTrue(query.sort.calledWith(undefined));
			});
		});
	});
});
