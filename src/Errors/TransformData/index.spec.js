import { assert } from 'chai';
import TransformDataError from './';

describe('TransformDataError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new TransformDataError();
			assert.strictEqual(error.name, 'TransformDataError');
			assert.strictEqual(error.transformClass, 'Unknown');
			assert.strictEqual(error.transformValue, 'Unknown');
			assert.strictEqual(error.message, 'Error transforming data from multivalue format');
		});

		it('should override default message', () => {
			const error = new TransformDataError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default transformClass value', () => {
			const error = new TransformDataError({ transformClass: 'foo' });
			assert.strictEqual(error.transformClass, 'foo');
		});

		it('should override default transformValue value', () => {
			const error = new TransformDataError({ transformValue: 'foo' });
			assert.strictEqual(error.transformValue, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new TransformDataError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
