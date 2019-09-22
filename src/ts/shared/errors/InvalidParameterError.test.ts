import InvalidParameterError from './InvalidParameterError';

const parameterName = 'parameterName';

test('should instantiate error with expected instance properties', (): void => {
	const error = new InvalidParameterError({ parameterName });
	const expected = {
		name: 'InvalidParameterError',
		message: 'Invalid parameter passed to function',
		parameterName,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new InvalidParameterError({
		message,
		parameterName,
	});
	expect(error.message).toEqual(message);
});
