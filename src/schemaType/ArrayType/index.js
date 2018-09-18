import castArray from 'lodash/castArray';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import ComplexType from 'schemaType/ComplexType';
import SimpleType from 'schemaType/SimpleType';
import InvalidParameterError from 'Errors/InvalidParameter';
import handleRequiredValidation from 'shared/handleRequiredValidation';

/**
 * An Array Schema Type
 * @extends ComplexType
 * @param {SimpleType} valueSchemaType - A schemaType representing the type of the array's contents
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class ArrayType extends ComplexType {
	constructor(valueSchemaType) {
		if (!(valueSchemaType instanceof SimpleType)) {
			// array values must be a child of SimpleType class
			throw new InvalidParameterError({ parameterName: 'valueSchemaType' });
		}
		super();

		const { required = false } = valueSchemaType.definition;

		/**
		 * A schemaType representing the type of the array's contents
		 * @member {SimpleType} _valueSchemaType
		 * @memberof ArrayType
		 * @instance
		 * @private
		 */
		this._valueSchemaType = valueSchemaType;
		/**
		 * Required validation value for the array
		 * @member {Boolean|Function} _required
		 * @memberof ArrayType
		 * @instance
		 * @private
		 */
		this._required = required;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof ArrayType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {*[]} Array of formatted data values
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
	 */
	get = record => {
		const value = this._valueSchemaType.getFromMvData(record);
		return typeof value === 'undefined'
			? []
			: castArray(value).map(itemValue => this._valueSchemaType.transformFromDb(itemValue));
	};

	/**
	 * Set specified array value into mv record
	 * @function set
	 * @memberof ArrayType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*[]} setValue - Array to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this._valueSchemaType.setIntoMvData(
			originalRecord,
			castArray(setValue).map(value => this._valueSchemaType.transformToDb(value)),
		);

	/**
	 * Validate the array
	 * @function validate
	 * @memberof ArrayType
	 * @instance
	 * @async
	 * @param {*[]} value - Array to validate
	 * @param {Document} document - Document object
	 * @returns {Promise.<string[]>} List of errors found while validating
	 */
	validate = async (value, document) => {
		const castValue = castArray(value);

		// combining all the validation into one array of promise.all
		// - validation against the values in the array will return an array of 0 to n errors for each value
		// - the validators against the entire array will return false or the appropriate error message
		// - flatten the results of all validators to ensure an array only 1-level deep
		// - compact the flattened array to remove any falsy values
		return compact(
			flatten(
				await Promise.all(
					this._validators
						.concat(handleRequiredValidation(this._required, this._validateRequired))
						.map(
							async ({ validator, message }) => !(await validator(castValue, document)) && message,
						)
						.concat(
							castValue.map(async arrayItem => this._valueSchemaType.validate(arrayItem, document)),
						),
				),
			),
		);
	};

	/* private instance methods */

	/**
	 * Array required validator
	 * @function _validateRequired
	 * @memberof ArrayType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Array to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateRequired = async value => value.length > 0;
}

export default ArrayType;
