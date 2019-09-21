/* eslint-disable-next-line import/named */
import BaseError, { __RewireAPI__ as RewireAPI } from './BaseError';

describe('BaseError', () => {
	const DisallowDirectError = class extends Error {};
	let Extension;
	beforeAll(() => {
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
		Extension = class extends BaseError {};
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('DisallowDirectError');
	});

	describe('constructor', () => {
		test('should throw if directly instantiated', () => {
			expect(() => new BaseError()).toThrow();
		});

		test('should set instance members with default values', () => {
			const error = new Extension();
			expect(error.source).toBe('mvom');
			expect(error.name).toBe('BaseError');
			expect(error.message).toBe('Base Error');
		});

		test('should override default message', () => {
			const error = new Extension({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default name', () => {
			const error = new Extension({ name: 'foo' });
			expect(error.name).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new Extension({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
