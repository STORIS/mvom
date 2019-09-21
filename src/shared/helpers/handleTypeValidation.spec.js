import handleTypeValidation from './handleTypeValidation';

describe('handleTypeValidation', () => {
	test('should return an object with validator and message properties', () => {
		const validationObject = handleTypeValidation(true);
		expect(typeof validationObject).toBe('object');
		expect(validationObject).toHaveProperty('validator');
		expect(validationObject).toHaveProperty('message');
	});

	test('should format the default message', () => {
		const { message } = handleTypeValidation();
		expect(message).toBe('Property cannot be cast into the defined type');
	});

	test('should return the specified validation function', () => {
		const { validator } = handleTypeValidation('foo');
		expect(validator).toBe('foo');
	});
});
