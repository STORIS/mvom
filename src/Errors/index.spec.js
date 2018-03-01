import { assert } from 'chai';
import Errors from './';

describe('Errors', () => {
	it('should export an object', () => {
		assert.isObject(Errors);
	});

	it('should contain classes which will be instances of Error', () => {
		Object.values(Errors).forEach(err => {
			assert.instanceOf(err.prototype, Error);
		});
	});
});
