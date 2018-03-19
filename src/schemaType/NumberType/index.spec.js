/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import NumberType from './';

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
			before(() => {
				numberType = new NumberType({ path: '1' });
			});

			beforeEach(() => {
				numberType._dbDecimals = 0;
			});

			it('should throw if value is not a number', () => {
				assert.throws(numberType.transformFromDb.bind(numberType, 'foo'));
			});

			it("should return null if the input value isn't provided", () => {
				assert.isNull(numberType.transformFromDb());
			});

			it('should return the same as input value if dbDecimals is 0', () => {
				numberType._dbDecimals = 0;
				assert.strictEqual(numberType.transformFromDb(12345), 12345);
			});

			it('should shift the decimal to the left 1 place if dbDecimals is 1', () => {
				numberType._dbDecimals = 1;
				assert.strictEqual(numberType.transformFromDb(12345), 1234.5);
			});

			it('should shift the decimal to the left 2 places if dbDecimals is 2', () => {
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformFromDb(12345), 123.45);
			});

			it('should round and truncate any decimals present in the original data', () => {
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformFromDb(12345.6), 123.46);
			});
		});

		describe('transformToDb', () => {
			let numberType;
			before(() => {
				numberType = new NumberType({ path: '1' });
			});

			beforeEach(() => {
				numberType._dbDecimals = 0;
			});

			it('should return null if null passed to function', () => {
				assert.isNull(numberType.transformToDb(null));
			});

			it('should shift the decimal to the right 2 places if dbDecimals is 2', () => {
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformToDb(123.45), '12345');
			});

			it('should round and truncate any decimals present in the original data', () => {
				numberType._dbDecimals = 2;
				assert.strictEqual(numberType.transformToDb(123.456), '12346');
			});
		});

		describe('_validateType', () => {
			let numberType;
			before(() => {
				numberType = new NumberType({ path: '1' });
			});

			it('should resolve as true if value is undefined', async () => {
				assert.isTrue(await numberType._validateType());
			});

			it('should resolve as true if value is null', async () => {
				assert.isTrue(await numberType._validateType(null));
			});

			it('should resolve as true if value is a finite number', async () => {
				assert.isTrue(await numberType._validateType(1337));
			});

			it('should resolve as true if value can be cast to a finite number', async () => {
				assert.isTrue(await numberType._validateType('1337'));
			});

			it('should resolve as false if value cannot be cast to a finite number', async () => {
				assert.isFalse(await numberType._validateType('foo'));
			});

			it('should resolve as false if value is numeric but not a finite number', async () => {
				assert.isFalse(await numberType._validateType(NaN));
			});
		});
	});
});
