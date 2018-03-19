import { assert } from 'chai';
import ConnectionManagerError from './';

describe('ConnectionManagerError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new ConnectionManagerError();
			assert.strictEqual(error.name, 'ConnectionManagerError');
			assert.deepEqual(error.request, {});
			assert.deepEqual(error.response, {});
			assert.strictEqual(error.message, 'Error in Connection Manager communication');
		});

		it('should override default message', () => {
			const error = new ConnectionManagerError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default request value', () => {
			const error = new ConnectionManagerError({ request: 'foo' });
			assert.strictEqual(error.request, 'foo');
		});

		it('should override default response value', () => {
			const error = new ConnectionManagerError({ response: 'foo' });
			assert.strictEqual(error.response, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new ConnectionManagerError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
