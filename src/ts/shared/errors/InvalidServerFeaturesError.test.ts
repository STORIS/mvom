import InvalidServerFeaturesError from './InvalidServerFeaturesError';

const invalidFeatures = ['invalid1', 'invalid2'];

test('should instantiate error with expected instance properties', (): void => {
	const error = new InvalidServerFeaturesError({ invalidFeatures });
	const expected = {
		name: 'InvalidServerFeaturesError',
		message: 'Invalid feature set on db server',
		invalidFeatures,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new InvalidServerFeaturesError({
		message,
		invalidFeatures,
	});
	expect(error.message).toEqual(message);
});
