import ConnectionError from '../ConnectionError';

test('should instantiate error with expected instance properties', () => {
	const error = new ConnectionError();
	const expected = {
		name: 'ConnectionError',
		message: 'Error connecting to DB Server',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new ConnectionError({
		message,
	});
	expect(error.message).toEqual(message);
});
