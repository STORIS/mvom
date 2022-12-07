import RecordVersionError from '../RecordVersionError';

const filename = 'filename';
const recordId = 'recordId';

test('should instantiate error with expected instance properties', (): void => {
	const error = new RecordVersionError({ filename, recordId });
	const expected = {
		name: 'RecordVersionError',
		message: 'Record has changed since it was read and cannot be updated',
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new RecordVersionError({
		message,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});
