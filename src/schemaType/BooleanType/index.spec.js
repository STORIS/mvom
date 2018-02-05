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

			it('should return true when given a 1', () => {
				assert.isTrue(booleanType.transformFromDb(1));
			});
		});
	});
});
