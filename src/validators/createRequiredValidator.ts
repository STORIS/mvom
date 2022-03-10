import type { ValidationFunction, Validator } from '../types';

/** Create Validator for required validation */
const handleRequiredValidation = (
	required: boolean,
	defaultValidator: ValidationFunction,
): Validator => {
	const defaultMessage = 'Property is required';

	// always return validation result of true if property is not required
	const validationFn = required ? defaultValidator : (): true => true;

	return { validator: validationFn, message: defaultMessage };
};

export default handleRequiredValidation;
