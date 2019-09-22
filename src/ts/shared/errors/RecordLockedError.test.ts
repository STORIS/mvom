import RecordLockedError from './RecordLockedError';

test('should instantiate error with expected instance properties', (): void => {
	const error = new RecordLockedError();
	const expected = {
		name: 'RecordLockedError',
		message: 'Record is locked and cannot be updated',
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new RecordLockedError({
		message,
	});
	expect(error.message).toEqual(message);
});
