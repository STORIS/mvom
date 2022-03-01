import NotImplementedError from '../NotImplementedError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new NotImplementedError();
	const expected = {
		name: 'NotImplementedError',
		message: 'Interface method not implemented',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new NotImplementedError({
		message,
	});
	expect(error.message).toEqual(message);
});
