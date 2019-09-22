import { InvalidParameterError } from '#shared/errors';
import SimpleType from './SimpleType';

/**
 * A String Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {string[]} [definition.enum] - Array of allowed values
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class StringType extends SimpleType {
	/**
	 * Create validation object for enum validation
	 * @function handleEnumValidation
	 * @memberof StringType
	 * @static
	 * @private
	 * @param {Function|AsyncFunction} defaultValidator - Enum validation function to use
	 * @returns {ValidationObject} Object containing validation function and failure message
	 */
	static handleEnumValidation = defaultValidator => {
		const message = 'Value not present in list of allowed values';

		return { validator: defaultValidator, message };
	};

	constructor(definition) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		if (definition.enum != null && !Array.isArray(definition.enum)) {
			throw new InvalidParameterError({ parameterName: 'definition.enum' });
		}

		super(definition);

		/**
		 * Array of allowed enumerations
		 * @member {string[]|null} _enum
		 * @memberof StringType
		 * @instance
		 * @private
		 */
		this._enum = definition.enum || null;

		// add validators for this type
		this._validators.unshift(StringType.handleEnumValidation(this._validateEnum));
	}

	/**
	 * Transform mv string to js string
	 * @function transformFromDb
	 * @memberof StringType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed value
	 */
	transformFromDb = value => {
		if (value == null) {
			// if this property has an enumeration constraint and one of those constraints is empty string then return empty string;
			// otherwise return null
			return this._enum !== null && this._enum.includes('') ? '' : null;
		}

		return String(value);
	};

	/**
	 * Transform js string to mv string
	 * @function transformToDb
	 * @memberof StringType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed value
	 */
	transformToDb = value => (value == null ? null : String(value));

	/**
	 * Enum validator
	 * @function _validateEnum
	 * @memberof StringType
	 * @instance
	 * @private
	 * @async
	 * @param {string} value - String to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateEnum = async value =>
		// skip validation on nullish values because a required valdation error, if applicable, is more helpful
		value == null || this._enum == null || this._enum.includes(value);

	/**
	 * String required validator
	 * @function _validateRequired
	 * @memberof StringType
	 * @override
	 * @instance
	 * @private
	 * @async
	 * @param {string} value - String to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateRequired = async value => value != null && value !== '';
}

export default StringType;
