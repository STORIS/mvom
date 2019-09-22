import DataValidationError from './DataValidationError';

describe('DataValidationError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new DataValidationError();
			expect(error.name).toBe('DataValidationError');
			expect(error.validationErrors).toEqual({});
			expect(error.message).toBe('Error(s) found while validating data');
		});

		test('should override default message', () => {
			const error = new DataValidationError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default validationErrors value', () => {
			const error = new DataValidationError({ validationErrors: 'foo' });
			expect(error.validationErrors).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new DataValidationError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
