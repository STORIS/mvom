import { cloneDeep, compact, set as setIn, toPath } from 'lodash';
import { DisallowDirectError, InvalidParameterError, NotImplementedError } from '#shared/errors';
import { getFromMvArray, handleRequiredValidation } from '#shared/utils';
import BaseType from './BaseType';

/**
 * A Simple Schema Type
 * @extends BaseType
 * @hideconstructor
 * @param {Object} [definition = {}] - Data definition
 * @param {string} [definition.path = null] - 1-index string path
 * @param {string} [definition.dictionary = null] - Multivalue dictionary id
 * @param {Boolean|Function} [definition.required = false] Indicates that a value is required when validating
 * @param {Object} [options = {}]
 * @param {Function} [options.encrypt] Encryption function to use to encrypt sensitive fields
 * @param {Function} [options.decrypt] Decryption function to use to decrypt sensitive fields
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 * @throws {InvalidParameterError} Path definition must be a string of integers split by periods
 */
class SimpleType extends BaseType {
	constructor(definition = {}, { encrypt, decrypt } = {}) {
		if (new.target === SimpleType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'SimpleType' });
		}

		super();

		const { dictionary = null, path = null, required = false, encrypted = false } = definition;

		if (encrypted) {
			if (typeof encrypt !== 'function') {
				throw new InvalidParameterError({
					message: 'Encrypt function required to process encrypted fields',
					parameterName: 'encrypt',
				});
			}

			if (typeof decrypt !== 'function') {
				throw new InvalidParameterError({
					message: 'Decrypt function required to process encrypted fields',
					parameterName: 'decrypt',
				});
			}
		}

		/**
		 * Data definition which this schema type was constructed from
		 * @member {Object} definition
		 * @memberof SimpleType
		 * @instance
		 */
		this.definition = definition;
		/**
		 * Multivalue dictionary id
		 * @member {string} dictionary
		 * @memberof SimpleType
		 * @instance
		 */
		this.dictionary = dictionary;
		/**
		 * 0-indexed Array path
		 * @member {Number[]} path
		 * @memberof SimpleType
		 * @instance
		 */
		this._normalizeMvPath(path);
		/**
		 * Required validation value for the schema type
		 * @member {Boolean|Function} _required
		 * @memberof SimpleType
		 * @instance
		 * @private
		 */
		this._required = required;
		/**
		 * Indicates whether data should be encrypted/decrypted
		 * @member {Boolean} _encrypted
		 * @memberof SimpleType
		 * @instance
		 * @private
		 */
		this._encrypted = encrypted;
		/**
		 * Encrypt function to call on sensitive data before writing to the database
		 * @member {Function} _encrypt
		 * @memberof SimpleType
		 * @instance
		 * @private
		 */
		this._encrypt = encrypt;
		/**
		 * Decrypt function to call on sensitive data encrypted in the database
		 * @member {Function} _decrypt
		 * @memberof SimpleType
		 * @instance
		 * @private
		 */
		this._decrypt = decrypt;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Formatted data value
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
	 */
	get = (record) => {
		const value = this.getFromMvData(record);
		return this.transformFromDb(value);
	};

	/**
	 * Get data from the specified keypath
	 * @function getFromMvData
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Value of data at specified location
	 */
	getFromMvData = (record) => {
		const value = getFromMvArray(this.path, record);
		return this._encrypted ? this._decrypt(value) : value;
	};

	/**
	 * Transform into multivalue format and set specified value into mv record
	 * @function set
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to transform and set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this.setIntoMvData(originalRecord, this.transformToDb(setValue));

	/**
	 * Set specified value into mv record
	 * @function set
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to set into record
	 * @returns {*[]} Array data of output record format
	 */
	setIntoMvData = (originalRecord, setValue) => {
		if (this.path == null) {
			return originalRecord;
		}

		const encryptedSetValue = this._encrypted ? this._encrypt(setValue) : setValue;
		return setIn(cloneDeep(originalRecord), this.path, encryptedSetValue);
	};

	/**
	 * Transform from mv data to externally formatted data
	 * @function transformFromDb
	 * @memberof SimpleType
	 * @abstract
	 * @instance
	 * @param {*} value - Value to transform
	 * @returns {*} Transformed value
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	transformFromDb() {
		throw new NotImplementedError({
			methodName: 'transformFromDb',
			className: this.constructor.name,
		});
	}

	/**
	 * Transform from externally formatted data to mv data
	 * @function transformToDb
	 * @memberof SimpleType
	 * @abstract
	 * @instance
	 * @param {*} value - Value to transform
	 * @returns {*} Transformed value
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	transformToDb() {
		throw new NotImplementedError({
			methodName: 'transformToDb',
			className: this.constructor.name,
		});
	}

	/**
	 * Transform query constants to the format schema
	 * @function transformToQuery
	 * @memberof SimpleType
	 * @instance
	 * @public
	 * @param {*} value - Value to convert
	 * @returns {*} No transformation - returns original input value
	 */
	transformToQuery = (value) => value;

	/**
	 * Validate the simple type
	 * @function validate
	 * @memberof SimpleType
	 * @instance
	 * @async
	 * @param {*} value - Simple type value to validate
	 * @param {Document} document - Document object
	 * @returns {Promise.<string[]>} List of errors found while validating
	 */
	async validate(value, document) {
		// combining all the validation into one array of promise.all
		// - a validator will return false or the appropriate error message
		// - compact the array of resolved promises to remove any falsy values
		return compact(
			await Promise.all(
				this._validators
					.concat(handleRequiredValidation(this._required, this._validateRequired))
					.map(async ({ validator, message }) => !(await validator(value, document)) && message),
			),
		);
	}
	/* private instance methods */

	/**
	 * Convert a 1-index string array path definition (e.g. '1.1.1') to a 0-index array path definition (e.g. [0, 0, 0])
	 * @function _normalizeMvPath
	 * @memberof SimpleType
	 * @instance
	 * @private
	 * @param {string} [path] - 1-indexed String path
	 * @returns {number[]} 0-indexed Array path
	 * @throws {InvalidParameterError} Path definition must be a string of integers split by periods
	 */
	_normalizeMvPath = (path) => {
		if (path == null) {
			this.path = null;
			return;
		}

		this.path = toPath(path).map((val) => {
			const numVal = +val;
			if (!Number.isInteger(numVal) || numVal < 1) {
				throw new InvalidParameterError({
					message: 'Path definition must be a string of integers split by periods',
					parameterName: 'path',
				});
			}
			return numVal - 1;
		});
	};

	/**
	 * SimpleType required validator
	 * @function _validateRequired
	 * @memberof SimpleType
	 * @instance
	 * @private
	 * @async
	 * @param {*} value - Value to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateRequired = async (value) => value != null;
}

export default SimpleType;
