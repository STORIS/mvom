import RecordLockedError from '../RecordLockedError';

const filename = 'filename';
const recordId = 'recordId';
const comoLogId = 'comoLogId';

test('should instantiate error with expected instance properties', () => {
	const error = new RecordLockedError({ filename, recordId });
	const expected = {
		name: 'RecordLockedError',
		message: 'Record is locked and cannot be updated',
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new RecordLockedError({
		message,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});

test('should set a como log key if given', () => {
	const error = new RecordLockedError({
		filename,
		recordId,
		comoLogId,
	});
	expect(error.comoLogId).toEqual(comoLogId);
});
