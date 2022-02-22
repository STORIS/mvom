import { ForeignKeyDbTransformer } from '#shared/classes';
import { InvalidParameterError } from '#shared/errors';
import SimpleType from './SimpleType';

/**
 * A String Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {string[]} [definition.enum] - Array of allowed values
 * @param {RegExp} [definition.match] - Regular expression to validate the property value against
 * @param {Object} [options = {}]
 * @param {Function} [options.encrypt] Encryption function to use to encrypt sensitive fields
 * @param {Function} [options.decrypt] Decryption function to use to decrypt sensitive fields
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class StringType extends SimpleType {
	constructor(definition, options) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		if (definition.enum != null && !Array.isArray(definition.enum)) {
			throw new InvalidParameterError({ parameterName: 'definition.enum' });
		}
		if (definition.match != null && !(definition.match instanceof RegExp)) {
			throw new InvalidParameterError({ parameterName: 'definition.match' });
		}

		super(definition, options);

		/**
		 * Array of allowed enumerations
		 * @member {string[]|null} _enum
		 * @memberof StringType
		 * @instance
		 * @private
		 */
		this._enum = definition.enum || null;

		/**
		 * Regular expression to validate the property value against
		 * @member {RegExp|null} _match
		 * @memberof StringType
		 * @instance
		 * @private
		 */
		this._match = definition.match || null;

		/**
		 * Transform schema foreign key definitions to the db format
		 * @member {ForeignKeyDbTransformer} _foreignKeyDbTransformer
		 * @memberof StringType
		 * @instance
		 * @private
		 */
		this._foreignKeyDbTransformer = new ForeignKeyDbTransformer(definition.foreignKey);

		// add validators for this type
		this._validators.unshift(StringType.matchValidation(this._validateMatch));
		this._validators.unshift(StringType.handleEnumValidation(this._validateEnum));
	}

	/**
	 * Create validation object for enum validation
	 * @function handleEnumValidation
	 * @memberof StringType
	 * @static
	 * @private
	 * @param {Function|AsyncFunction} defaultValidator - Enum validation function to use
	 * @returns {ValidationObject} Object containing validation function and failure message
	 */
	static handleEnumValidation = (defaultValidator) => {
		const message = 'Value not present in list of allowed values';

		return { validator: defaultValidator, message };
	};

	/**
	 * Create validation object for match validation
	 * @function matchValidation
	 * @memberof StringType
	 * @static
	 * @private
	 * @param {Function|AsyncFunction} defaultValidator - Match validation function to use
	 * @returns {ValidationObject} Object containing validation function and failure message
	 */
	static matchValidation = (defaultValidator) => {
		const message = 'Value does not match pattern';

		return { validator: defaultValidator, message };
	};

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
	transformFromDb = (value) => {
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
	transformToDb = (value) => (value == null ? null : String(value));

	/**
	 * Create an array of foreign key definitions that will be validated before save
	 * @function transformForeignKeyDefinitionsToDb
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @param {*} value - Foreign key value which will be checked against the foreign file
	 * @returns {*[]} Array of foreign key definitions
	 */
	transformForeignKeyDefinitionsToDb = (value) => this._foreignKeyDbTransformer.transform(value);

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
	_validateEnum = async (value) =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		value == null || this._enum == null || this._enum.includes(value);

	/**
	 * Match validator
	 * @function _validateMatch
	 * @memberof StringType
	 * @instance
	 * @private
	 * @async
	 * @param {string} value - String to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateMatch = async (value) =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		value == null || this._match == null || this._match.test(value);

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
	_validateRequired = async (value) => value != null && value !== '';
}

export default StringType;
