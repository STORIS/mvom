import ForeignKeyValidationError from '../ForeignKeyValidationError';

const foreignKeyValidationErrors = [{ entityName: 'entityName', entityId: 'entityId' }];
const filename = 'filename';
const recordId = 'recordId';

test('should instantiate error with expected instance properties', (): void => {
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

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new ForeignKeyValidationError({
		message,
		foreignKeyValidationErrors,
		filename,
		recordId,
	});
	expect(error.message).toEqual(message);
});
