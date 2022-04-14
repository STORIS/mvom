import QueryLimitError from '../QueryLimitError';

test('should instantiate error with expected instance properties', () => {
	const error = new QueryLimitError();
	const expected = {
		name: 'QueryLimitError',
		message: 'Query exceeds database server limits',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new QueryLimitError({
		message,
	});
	expect(error.message).toEqual(message);
});
