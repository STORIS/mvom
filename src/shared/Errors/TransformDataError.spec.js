import TransformDataError from './TransformDataError';

describe('TransformDataError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new TransformDataError();
			expect(error.name).toBe('TransformDataError');
			expect(error.transformClass).toBe('Unknown');
			expect(error.transformValue).toBe('Unknown');
			expect(error.message).toBe('Error transforming data from multivalue format');
		});

		test('should override default message', () => {
			const error = new TransformDataError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default transformClass value', () => {
			const error = new TransformDataError({ transformClass: 'foo' });
			expect(error.transformClass).toBe('foo');
		});

		test('should override default transformValue value', () => {
			const error = new TransformDataError({ transformValue: 'foo' });
			expect(error.transformValue).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new TransformDataError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
