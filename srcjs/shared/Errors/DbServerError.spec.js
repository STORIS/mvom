/* eslint-disable-next-line import/named */
import DbServerError, { __RewireAPI__ as RewireAPI } from './DbServerError';

describe('DbServerError', () => {
	beforeAll(() => {
		RewireAPI.__Rewire__('dbErrors', { foo: { code: 1, message: 'bar' } });
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('dbErrors');
	});

	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new DbServerError();
			expect(error.name).toBe('DbServerError');
			expect(error.message).toBe('Unknown database server error');
		});

		test('should override default message', () => {
			const error = new DbServerError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should use default message if errorCode cannot be found in dbErrors', () => {
			const error = new DbServerError({ errorCode: 'notfound' });
			expect(error.message).toBe('Unknown database server error');
		});

		test('should use message from dbError code if errorCode is found in dbErrors', () => {
			const error = new DbServerError({ errorCode: 1 });
			expect(error.message).toBe('bar');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new DbServerError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
