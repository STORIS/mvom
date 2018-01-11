import { assert } from 'chai';
import Connection from './';

describe('Connection', () => {
	const connection = new Connection();

	describe('model method', () => {
		it('should do nothing', () => {
			assert.isUndefined(connection.model());
		});
	});
});
