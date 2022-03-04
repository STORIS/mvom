import ForeignKeyValidationError from '../ForeignKeyValidationError';

const foreignKeyValidationErrors = [{ entityName: 'entityName', entityId: 'entityId' }];

test('should instantiate error with expected instance properties', (): void => {
	const error = new ForeignKeyValidationError({ foreignKeyValidationErrors });
	const expected = {
		name: 'ForeignKeyValidationError',
		message: 'Foreign key violation(s) encountered while saving',
		foreignKeyValidationErrors,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const message = 'foo';
	const error = new ForeignKeyValidationError({
		message,
		foreignKeyValidationErrors,
	});
	expect(error.message).toEqual(message);
});
