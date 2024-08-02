import RecordNotFoundError from '../RecordNotFoundError';

const filename = 'filename';
const recordId = 'recordId';

test('should instantiate error with expected instance properties', (): void => {
	const error = new RecordNotFoundError({ filename, recordId });
	const expected = {
		name: 'RecordNotFoundError',
		message: 'Database record not found',
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new RecordNotFoundError({
		message,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});
