import type { ValidationFunction, Validator } from '#shared/types';

/**
 * Create Validator for type validation
 */
const handleTypeValidation = (defaultValidator: ValidationFunction): Validator => {
	const message = 'Property cannot be cast into the defined type';

	return { validator: defaultValidator, message };
};

export default handleTypeValidation;
