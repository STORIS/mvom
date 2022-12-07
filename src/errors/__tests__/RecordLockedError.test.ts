import RecordLockedError from '../RecordLockedError';

const filename = 'filename';
const recordId = 'recordId';

test('should instantiate error with expected instance properties', (): void => {
	const error = new RecordLockedError({ filename, recordId });
	const expected = {
		name: 'RecordLockedError',
		message: 'Record is locked and cannot be updated',
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new RecordLockedError({
		message,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});
