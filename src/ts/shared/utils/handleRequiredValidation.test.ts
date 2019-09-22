import handleRequiredValidation from './handleRequiredValidation';

const defaultValidator = (): false => false;

test('should return validator function which evaluates to true and empty message if required is false', (): void => {
	const { validator, message } = handleRequiredValidation(false, defaultValidator);
	expect(validator).toBeInstanceOf(Function);
	expect(validator()).toEqual(true);
	expect(message).toEqual('');
});

test('should return default validator and message if required is true', (): void => {
	const { validator, message } = handleRequiredValidation(true, defaultValidator);
	expect(validator).toEqual(defaultValidator);
	expect(message).toEqual('Property is required');
});

test('should return custom validator and default message if required is a function', (): void => {
	const validationFunction = (): true => true;
	const { validator, message } = handleRequiredValidation(validationFunction, defaultValidator);
	expect(validator).toEqual(validationFunction);
	expect(message).toEqual('Property is required');
});

test('should return custom validator and overridden message if required is a tuple', (): void => {
	const validationFunction = (): true => true;
	const overrideMessage = 'test message';
	const { validator, message } = handleRequiredValidation(
		[validationFunction, overrideMessage],
		defaultValidator,
	);
	expect(validator).toEqual(validationFunction);
	expect(message).toEqual(overrideMessage);
});
