import ConnectionError from '../ConnectionError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new ConnectionError();
	const expected = {
		name: 'ConnectionError',
		message: 'Error connecting to DB Server',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new ConnectionError({
		message,
	});
	expect(error.message).toEqual(message);
});
