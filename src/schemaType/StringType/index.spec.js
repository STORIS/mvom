/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import StringType from './';

describe('StringType', () => {
	describe('constructor', () => {
		it('should throw if a path is not provided in the definition', () => {
			assert.throws(() => new StringType({}));
		});

		it('should not throw if a path is provided in the definition', () => {
			assert.doesNotThrow(() => new StringType({ path: '1' }));
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should return null if value is not provided', () => {
				assert.isNull(stringType.transformFromDb());
			});

			it('should return passed string value', () => {
				assert.strictEqual(stringType.transformFromDb('foo'), 'foo');
			});

			it('should return cast string value', () => {
				assert.strictEqual(stringType.transformFromDb(1337), '1337');
			});
		});

		describe('transformToDb', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should return a string without alteration', () => {
				assert.strictEqual(stringType.transformToDb('foo'), 'foo');
			});

			it('should return null if null passed', () => {
				assert.isNull(stringType.transformToDb(null));
			});

			it('should typecast if a non-string is passed', () => {
				assert.strictEqual(stringType.transformToDb(1234), '1234');
			});
		});

		describe('_validateRequired', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should resolve as false if value is undefined', async () => {
				assert.isFalse(await stringType._validateRequired());
			});

			it('should resolve as false if value is null', async () => {
				assert.isFalse(await stringType._validateRequired(null));
			});

			it('should resolve as false if value is empty string', async () => {
				assert.isFalse(await stringType._validateRequired(''));
			});

			it('should resolve as true if value is anything else', async () => {
				assert.isTrue(await stringType._validateRequired('foo'));
			});
		});
	});
});
