import NotImplementedError from './NotImplementedError';

describe('NotImplementedError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new NotImplementedError();
			expect(error.name).toBe('NotImplementedError');
			expect(error.methodName).toBe('Unknown');
			expect(error.className).toBe('Unknown');
			expect(error.message).toBe('Interface method not implemented');
		});

		test('should override default message', () => {
			const error = new NotImplementedError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default methodName value', () => {
			const error = new NotImplementedError({ methodName: 'foo' });
			expect(error.methodName).toBe('foo');
		});

		test('should override default className value', () => {
			const error = new NotImplementedError({ className: 'foo' });
			expect(error.className).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new NotImplementedError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
