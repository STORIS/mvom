import TimeoutError from '../TimeoutError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new TimeoutError();
	const expected = {
		name: 'TimeoutError',
		message: 'The request to the DB server timed out',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new TimeoutError({
		message,
	});
	expect(error.message).toEqual(message);
});
