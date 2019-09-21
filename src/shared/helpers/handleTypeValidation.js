/**
 * Create validation object for type validation
 * @function handleTypeValidation
 * @package
 * @private
 * @param {Function|AsyncFunction} defaultValidator - Type validation function to use
 * @returns {ValidationObject} Object containing validation function and failure message
 */
const handleTypeValidation = defaultValidator => {
	const message = 'Property cannot be cast into the defined type';

	return { validator: defaultValidator, message };
};

export default handleTypeValidation;
