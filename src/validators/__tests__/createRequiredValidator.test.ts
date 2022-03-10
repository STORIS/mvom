import createRequiredValidator from '../createRequiredValidator';

const defaultValidator = (): false => false;

test('should return default validator and message', (): void => {
	const { validator, message } = createRequiredValidator(defaultValidator);
	expect(validator).toEqual(defaultValidator);
	expect(message).toBe('Property is required');
});
