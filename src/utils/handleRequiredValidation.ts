import type { ValidationFunction, Validator } from '../types';

/** Create Validator for required validation */
const handleRequiredValidation = (
	required: boolean,
	defaultValidator: ValidationFunction,
): Validator => {
	const defaultMessage = 'Property is required';

	if (required) {
		return { validator: defaultValidator, message: defaultMessage };
	}

	// always return validation result of true if property is not required
	return { validator: (): true => true, message: '' };
};

export default handleRequiredValidation;
