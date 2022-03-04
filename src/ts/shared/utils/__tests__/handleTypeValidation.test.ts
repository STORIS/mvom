import handleTypeValidation from '../handleTypeValidation';

const defaultValidator = (): false => false;

test('should return default validator and message', (): void => {
	const { validator, message } = handleTypeValidation(defaultValidator);
	expect(validator).toEqual(defaultValidator);
	expect(message).toBe('Property cannot be cast into the defined type');
});
