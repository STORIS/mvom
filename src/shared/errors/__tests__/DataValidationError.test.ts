import DataValidationError from '../DataValidationError';

const validationErrors = { foo: 'foo' };

test('should instantiate error with expected instance properties', (): void => {
	const error = new DataValidationError({ validationErrors });
	const expected = {
		name: 'DataValidationError',
		message: 'Error(s) found while validating data',
		validationErrors,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new DataValidationError({
		message,
		validationErrors,
	});
	expect(error.message).toEqual(message);
});
