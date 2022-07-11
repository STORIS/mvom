import RecordVersionError from '../RecordVersionError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new RecordVersionError();
	const expected = {
		name: 'RecordVersionError',
		message: 'Record has changed since it was read and cannot be updated',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new RecordVersionError({
		message,
	});
	expect(error.message).toEqual(message);
});
