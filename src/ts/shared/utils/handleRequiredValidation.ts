import type { SchemaValidator, ValidationFunction, Validator } from '#shared/types';

/**
 * Create Validator for required validation
 */
const handleRequiredValidation = (
	required: boolean | SchemaValidator,
	defaultValidator: ValidationFunction,
): Validator => {
	const defaultMessage = 'Property is required';

	if (typeof required === 'boolean') {
		if (required) {
			return { validator: defaultValidator, message: defaultMessage };
		}

		// always return validation result of true if property is not required
		return { validator: (): true => true, message: '' };
	}

	if (Array.isArray(required)) {
		const [validator, validatorMessage] = required;
		return { validator, message: validatorMessage };
	}

	return { validator: required, message: defaultMessage };
};

export default handleRequiredValidation;
