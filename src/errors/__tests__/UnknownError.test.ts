import UnknownError from '../UnknownError';

test('should instantiate error with expected instance properties', () => {
	const cause = new Error();
	const error = new UnknownError(cause);
	const expected = {
		name: 'UnknownError',
		message: 'An unknown error has occurred',
		cause,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const cause = new Error();
	const message = 'foo';
	const error = new UnknownError(cause, { message });
	expect(error.message).toEqual(message);
});
