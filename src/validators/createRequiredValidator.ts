import type { ValidationFunction, Validator } from '../types';

/** Create Validator for required validation */
const createRequiredValidator = (validationFn: ValidationFunction): Validator => {
	const defaultMessage = 'Property is required';

	return { validator: validationFn, message: defaultMessage };
};

export default createRequiredValidator;
