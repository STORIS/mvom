import { assert } from 'chai';
import connectionStatus from './connectionStatus';

describe('connectionStatus', () => {
	it('should export an object', () => {
		assert.isObject(connectionStatus);
	});

	it('each property should be a string', () => {
		Object.values(connectionStatus).forEach(val => {
			assert.isString(val, `${val} is not a string`);
		});
	});
});
