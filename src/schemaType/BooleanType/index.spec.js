import { assert } from 'chai';
import BooleanType from './';

describe('BooleanType', () => {
	describe('constructor', () => {
		it('should throw if a path is not provided in the definition', () => {
			assert.throws(() => new BooleanType({}));
		});

		it('should not throw if a path is provided in the definition', () => {
			assert.doesNotThrow(() => new BooleanType({ path: '1' }));
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let booleanType;
			before(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			it('should return false when given a 0', () => {
				assert.isFalse(booleanType.transformFromDb(0));
			});

			it('should return false when given a string "0"', () => {
				assert.isFalse(booleanType.transformFromDb('0'));
			});

			it('should return false when given null', () => {
				assert.isFalse(booleanType.transformFromDb(null));
			});

			it('should return true when given a 1', () => {
				assert.isTrue(booleanType.transformFromDb(1));
			});

			it('should return true when given any string', () => {
				assert.isTrue(booleanType.transformFromDb('foo'));
			});
		});

		describe('transformToDb', () => {
			let booleanType;
			before(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			it('should return 1 if parameter is true', () => {
				assert.strictEqual(booleanType.transformToDb(true), '1');
			});

			it('should return 1 if parameter is truthy', () => {
				assert.strictEqual(booleanType.transformToDb('foo'), '1');
			});

			it('should return 0 if parameter is false', () => {
				assert.strictEqual(booleanType.transformToDb(false), '0');
			});

			it('should return 0 if parameter is falsy', () => {
				assert.strictEqual(booleanType.transformToDb(0), '0');
			});
		});

		describe('transformToQuery', () => {
			let booleanType;
			before(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			describe('truthy', () => {
				it('should return 1 for Boolean true', () => {
					assert.strictEqual(booleanType.transformToQuery(true), '1');
				});

				it('should return 1 for string true', () => {
					assert.strictEqual(booleanType.transformToQuery('true'), '1');
				});

				it('should return 1 for string TRUE', () => {
					assert.strictEqual(booleanType.transformToQuery('TRUE'), '1');
				});
			});

			describe('falsy', () => {
				it('should return 0 for Boolean false', () => {
					assert.strictEqual(booleanType.transformToQuery(false), '0');
				});

				it('should return 0 for string false', () => {
					assert.strictEqual(booleanType.transformToQuery('false'), '0');
				});

				it('should return 0 for string FALSE', () => {
					assert.strictEqual(booleanType.transformToQuery('FALSE'), '0');
				});
			});

			describe('other', () => {
				it('should return the passed value', () => {
					assert.strictEqual(booleanType.transformToQuery('foo'), 'foo');
				});
			});
		});
	});
});
