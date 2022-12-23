import InvalidServerFeaturesError from '../InvalidServerFeaturesError';

test('should instantiate error with expected instance properties', () => {
	const error = new InvalidServerFeaturesError();
	const expected = {
		name: 'InvalidServerFeaturesError',
		message: 'Invalid feature set on db server',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new InvalidServerFeaturesError({
		message,
	});
	expect(error.message).toEqual(message);
});
