import { assert } from 'chai';
import NotImplementedError from './';

describe('NotImplementedError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new NotImplementedError();
			assert.strictEqual(error.name, 'NotImplementedError');
			assert.strictEqual(error.methodName, 'Unknown');
			assert.strictEqual(error.className, 'Unknown');
			assert.strictEqual(error.message, 'Interface method not implemented');
		});

		it('should override default message', () => {
			const error = new NotImplementedError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default methodName value', () => {
			const error = new NotImplementedError({ methodName: 'foo' });
			assert.strictEqual(error.methodName, 'foo');
		});

		it('should override default className value', () => {
			const error = new NotImplementedError({ className: 'foo' });
			assert.strictEqual(error.className, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new NotImplementedError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
