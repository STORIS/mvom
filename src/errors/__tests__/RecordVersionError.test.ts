import RecordVersionError from '../RecordVersionError';

const filename = 'filename';
const recordId = 'recordId';
const comoLogId = 'comoLogId';

test('should instantiate error with expected instance properties', () => {
	const error = new RecordVersionError({ filename, recordId });
	const expected = {
		name: 'RecordVersionError',
		message: 'Record has changed since it was read and cannot be updated',
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new RecordVersionError({
		message,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});

test('should set a como log key if given', () => {
	const error = new RecordVersionError({
		filename,
		recordId,
		comoLogId,
	});
	expect(error.comoLogId).toEqual(comoLogId);
});
