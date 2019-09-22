import DisallowDirectError from './DisallowDirectError';

describe('DisallowDirectError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new DisallowDirectError();
			expect(error.name).toBe('DisallowDirectError');
			expect(error.source).toBe('mvom');
			expect(error.className).toBe('Unknown');
			expect(error.message).toBe('This class cannot be instantiated directly');
		});

		test('should override default message', () => {
			const error = new DisallowDirectError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default class name', () => {
			const error = new DisallowDirectError({ className: 'foo' });
			expect(error.className).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new DisallowDirectError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
