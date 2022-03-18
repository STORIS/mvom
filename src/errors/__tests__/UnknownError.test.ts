import UnknownError from '../UnknownError';

test('should instantiate error with expected instance properties', () => {
	const error = new UnknownError();
	const expected = {
		name: 'UnknownError',
		message: 'An unknown error has occurred',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new UnknownError({
		message,
	});
	expect(error.message).toEqual(message);
});
