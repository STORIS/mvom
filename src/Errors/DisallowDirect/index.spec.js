import { assert } from 'chai';
import DisallowDirectError from './';

describe('DisallowDirectError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new DisallowDirectError();
			assert.strictEqual(error.name, 'DisallowDirectError');
			assert.strictEqual(error.className, 'Unknown');
			assert.strictEqual(error.message, 'This class cannot be instantiated directly');
		});

		it('should override default message', () => {
			const error = new DisallowDirectError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default class name', () => {
			const error = new DisallowDirectError({ className: 'foo' });
			assert.strictEqual(error.className, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new DisallowDirectError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
