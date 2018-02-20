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
	});
});
