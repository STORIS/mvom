/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import NumberType, { __RewireAPI__ as RewireAPI } from './';

describe('NumberType', () => {
	describe('constructor', () => {
		it('should throw if a path is not provided in the definition', () => {
			assert.throws(() => new NumberType({}));
		});

		it('should throw if dbDecimals is a non-integer decimal', () => {
			assert.throws(() => new NumberType({ path: '1', dbDecimals: 1.1 }));
		});

		it('should throw if dbDecimals is a non-integer string', () => {
			assert.throws(() => new NumberType({ path: '1', dbDecimals: 'foo' }));
		});

		it('should not throw if a path is provided in the definition', () => {
			assert.doesNotThrow(() => new NumberType({ path: '1' }));
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let numberType;
			const isNumber = stub();
			before(() => {
				numberType = new NumberType({ path: '1' });
				RewireAPI.__Rewire__('isNumber', isNumber);
			});

			after(() => {
				RewireAPI.__ResetDependency__('isNumber');
			});

			beforeEach(() => {
				numberType._dbDecimals = 0;
				isNumber.reset();
			});

			it('should throw if value is not a number', () => {
				isNumber.returns(false);
				assert.throws(numberType.transformFromDb.bind(numberType, 'foo'));
			});

			it('should return the same as input value if dbDecimals is 0', () => {
				isNumber.returns(true);
				numberType._dbDecimals = 0;
				assert.strictEqual(numberType.transformFromDb(12345), 12345);
			});

			it('should shift the decimal to the left 1 place if dbDecimals is 1', () => {
				isNumber.returns(true);
				numberType._dbDecimals = 1;
				assert.strictEqual(numberType.transformFromDb(12345), 1234.5);
			});

			it('should shift the decimal to the left 2 places if dbDecimals is 2', () => {
				isNumber.returns(true);
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformFromDb(12345), 123.45);
			});

			it('should round and truncate any decimals present in the original data', () => {
				isNumber.returns(true);
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformFromDb(12345.6), 123.46);
			});
		});
	});
});
