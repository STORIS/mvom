import handleRequireValidation from './handleRequiredValidation';

describe('handleRequireValidation', () => {
	test('should return an object with validator property if no parameters are passed', () => {
		const validationObject = handleRequireValidation();
		expect(typeof validationObject).toBe('object');
		expect(validationObject).toHaveProperty('validator');
	});

	test('should return an object with validator and message properties if required is true', () => {
		const validationObject = handleRequireValidation(true);
		expect(typeof validationObject).toBe('object');
		expect(validationObject).toHaveProperty('validator');
		expect(validationObject).toHaveProperty('message');
	});

	test('should format the default message', () => {
		const { message } = handleRequireValidation(true);
		expect(message).toBe('Property is required');
	});

	test('should allow message to be overridden', () => {
		const { message } = handleRequireValidation([true, 'foo']);
		expect(message).toBe('foo');
	});

	test('should return a function that resolves to true if required validation is false', async () => {
		const { validator } = handleRequireValidation(false);
		expect(await validator()).toBe(true);
	});

	test('should return the passed defaultValidator if required is true', () => {
		const { validator } = handleRequireValidation(true, 'foo');
		expect(validator).toBe('foo');
	});

	test('should return the override validator if required is a function', async () => {
		const { validator } = handleRequireValidation(async () => 'foo');
		expect(await validator()).toBe('foo');
	});
});
