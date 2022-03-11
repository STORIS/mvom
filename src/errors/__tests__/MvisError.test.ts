import MvisError from '../MvisError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new MvisError();
	const expected = {
		name: 'MvisError',
		message: 'Error in MVIS communication',
		mvisRequest: {},
		mvisResponse: {},
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

test('should allow for override of mvisRequest', (): void => {
	const mvisRequest = { foo: 'foo' };
	const error = new MvisError({
		mvisRequest,
	});
	expect(error.mvisRequest).toEqual(mvisRequest);
});

test('should allow for override of mvisResponse', (): void => {
	const mvisResponse = { foo: 'foo' };
	const error = new MvisError({
		mvisResponse,
	});
	expect(error.mvisResponse).toEqual(mvisResponse);
});
