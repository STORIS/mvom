import type { ValidationFunction, Validator } from '../types';

/** Create Validator for type validation */
const handleTypeValidation = (validationFn: ValidationFunction): Validator => {
	const message = 'Property cannot be cast into the defined type';

	return { validator: validationFn, message };
};

export default handleTypeValidation;
