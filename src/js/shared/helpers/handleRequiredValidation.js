import { castArray, isFunction } from 'lodash';

/**
 * Create validation object for required validation
 * @function handleRequireValidation
 * @package
 * @private
 * @param {requiredProperty} requiredProperty - Value of required property from schema definition
 * @param {Function|AsyncFunction} defaultValidator - Required function to use if property is required and validation not overridden
 * @returns {ValidationObject} Object containing validation function and failure message
 */
const handleRequireValidation = (requiredProperty, defaultValidator) => {
	const [requiredValue = false, message = 'Property is required'] = castArray(requiredProperty);
	if (!requiredValue) {
		// always return true
		return { validator: async () => true };
	}

	return isFunction(requiredValue)
		? { validator: requiredValue, message }
		: { validator: defaultValidator, message };
};

export default handleRequireValidation;
