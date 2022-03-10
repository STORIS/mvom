import createTypeValidator from '../createTypeValidator';

const defaultValidator = (): false => false;

test('should return default validator and message', (): void => {
	const { validator, message } = createTypeValidator(defaultValidator);
	expect(validator).toEqual(defaultValidator);
	expect(message).toBe('Property cannot be cast into the defined type');
});
