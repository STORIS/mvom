import InvalidParameterError from './InvalidParameterError';

describe('InvalidParameterError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new InvalidParameterError();
			expect(error.name).toBe('InvalidParameterError');
			expect(error.parameterName).toBe('Unknown');
			expect(error.message).toBe('Invalid parameter passed to function');
		});

		test('should override default message', () => {
			const error = new InvalidParameterError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default parameterName value', () => {
			const error = new InvalidParameterError({ parameterName: 'foo' });
			expect(error.parameterName).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new InvalidParameterError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
