import createRequiredValidator from '../createRequiredValidator';

const defaultValidator = (): false => false;

test('should return default validator and message', (): void => {
	const { validationFn, message } = createRequiredValidator(defaultValidator);
	expect(validationFn).toEqual(defaultValidator);
	expect(message).toBe('Property is required');
});
