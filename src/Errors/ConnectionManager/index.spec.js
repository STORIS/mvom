import { assert } from 'chai';
import ConnectionManagerError from './';

describe('ConnectionManagerError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new ConnectionManagerError();
			assert.strictEqual(error.name, 'ConnectionManagerError');
			assert.deepEqual(error.connectionManagerRequest, {});
			assert.deepEqual(error.connectionManagerResponse, {});
			assert.strictEqual(error.message, 'Error in Connection Manager communication');
		});

		it('should override default message', () => {
			const error = new ConnectionManagerError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default connectionManagerRequest value', () => {
			const error = new ConnectionManagerError({ connectionManagerRequest: 'foo' });
			assert.strictEqual(error.connectionManagerRequest, 'foo');
		});

		it('should override default connectionManagerResponse value', () => {
			const error = new ConnectionManagerError({ connectionManagerResponse: 'foo' });
			assert.strictEqual(error.connectionManagerResponse, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new ConnectionManagerError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
