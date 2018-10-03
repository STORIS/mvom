/**
 * Create validation object for enum validation
 * @function handleEnumValidation
 * @package
 * @private
 * @param {Function|AsyncFunction} defaultValidator - Enum validation function to use
 * @returns {ValidationObject} Object containing validation function and failure message
 */
const handleEnumValidation = defaultValidator => {
	const message = 'Value not present in list of allowed values';

	return { validator: defaultValidator, message };
};

export default handleEnumValidation;
