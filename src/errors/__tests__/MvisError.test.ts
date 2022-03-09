import MvisError from '../MvisError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new MvisError();
	const expected = {
		name: 'ConnectionManagerError',
		message: 'Error in Connection Manager communication',
		connectionManagerRequest: {},
		connectionManagerResponse: {},
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new MvisError({
		message,
	});
	expect(error.message).toEqual(message);
});

test('should allow for override of connectionManagerRequest', (): void => {
	const connectionManagerRequest = { foo: 'foo' };
	const error = new MvisError({
		connectionManagerRequest,
	});
	expect(error.connectionManagerRequest).toEqual(connectionManagerRequest);
});

test('should allow for override of connectionManagerResponse', (): void => {
	const connectionManagerResponse = { foo: 'foo' };
	const error = new MvisError({
		connectionManagerResponse,
	});
	expect(error.connectionManagerResponse).toEqual(connectionManagerResponse);
});
