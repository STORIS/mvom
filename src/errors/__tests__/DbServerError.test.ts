import { dbErrors } from '../../constants';
import DbServerError from '../DbServerError';

// use one of the codes from the errors table
const dbError = Object.values(dbErrors)[0];

test('should instantiate error with expected instance properties', () => {
	const error = new DbServerError({ errorCode: dbError.code });
	const expected = {
		name: 'DbServerError',
		message: dbError.message,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new DbServerError({
		message,
		errorCode: dbError.code,
	});
	expect(error.message).toEqual(message);
});

test('should use default message if errorCode is not found', () => {
	// @ts-expect-error: intentionally passing an invalid error code
	const error = new DbServerError({ errorCode: -9999 });
	const expectedMessage = 'Unknown database server error';
	expect(error.message).toEqual(expectedMessage);
});
