import { assert } from 'chai';
import StringType from './';

describe('StringType', () => {
	it('should throw if a path is not provided in the definition', () => {
		assert.throws(() => new StringType({}));
	});

	it('should not throw if a path is provided in the definition', () => {
		assert.doesNotThrow(() => new StringType({ path: '1' }));
	});
});
