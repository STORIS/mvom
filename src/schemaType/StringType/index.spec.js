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

			it('should return empty string if value is not provided', () => {
				assert.strictEqual(stringType.transformFromDb(), '');
			});

			it('should return passed string value', () => {
				assert.strictEqual(stringType.transformFromDb('foo'), 'foo');
			});

			it('should return cast string value', () => {
				assert.strictEqual(stringType.transformFromDb(1337), '1337');
			});
		});
	});
});
