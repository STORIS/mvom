import DataValidationError from '../DataValidationError';

const validationErrors = new Map([['foo', 'foo']]);
const filename = 'filename';
const recordId = 'recordId';

test('should instantiate error with expected instance properties', (): void => {
	const error = new DataValidationError({ validationErrors, filename, recordId });
	const expected = {
		name: 'DataValidationError',
		message: 'Error(s) found while validating data',
		validationErrors,
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new DataValidationError({
		message,
		validationErrors,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});
