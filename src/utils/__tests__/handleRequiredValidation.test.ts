import handleRequiredValidation from '../handleRequiredValidation';

const defaultValidator = (): false => false;

test('should return validator function which evaluates to true and empty message if required is false', (): void => {
	const { validator, message } = handleRequiredValidation(false, defaultValidator);
	expect(validator).toBeInstanceOf(Function);
	expect(validator(null, { foo: null })).toBe(true);
	expect(message).toBe('');
});

test('should return default validator and message if required is true', (): void => {
	const { validator, message } = handleRequiredValidation(true, defaultValidator);
	expect(validator).toEqual(defaultValidator);
	expect(message).toBe('Property is required');
});
