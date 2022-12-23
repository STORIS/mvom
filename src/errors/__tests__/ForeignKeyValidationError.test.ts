import ForeignKeyValidationError from '../ForeignKeyValidationError';

const foreignKeyValidationErrors = [{ entityName: 'entityName', entityId: 'entityId' }];
const filename = 'filename';
const recordId = 'recordId';
const comoLogId = 'comoLogId';

test('should instantiate error with expected instance properties', () => {
	const error = new ForeignKeyValidationError({ foreignKeyValidationErrors, filename, recordId });
	const expected = {
		name: 'ForeignKeyValidationError',
		message: 'Foreign key violation(s) encountered while saving',
		foreignKeyValidationErrors,
		filename,
		recordId,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new ForeignKeyValidationError({
		message,
		foreignKeyValidationErrors,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});

test('should set a como log key if given', () => {
	const error = new ForeignKeyValidationError({
		foreignKeyValidationErrors,
		filename,
		recordId,
		comoLogId,
	});
	expect(error.comoLogId).toEqual(comoLogId);
});
