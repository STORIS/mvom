import { assert } from 'chai';
import InvalidParameterError from './';

describe('InvalidParameterError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new InvalidParameterError();
			assert.strictEqual(error.name, 'InvalidParameterError');
			assert.strictEqual(error.parameterName, 'Unknown');
			assert.strictEqual(error.message, 'Invalid parameter passed to function');
		});

		it('should override default message', () => {
			const error = new InvalidParameterError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default parameterName value', () => {
			const error = new InvalidParameterError({ parameterName: 'foo' });
			assert.strictEqual(error.parameterName, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new InvalidParameterError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
