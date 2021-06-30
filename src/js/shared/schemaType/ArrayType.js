import { castArray, compact, flatten } from 'lodash';
import BasePrimitiveArrayType from './BasePrimitiveArrayType';

/**
 * An Array Schema Type
 * @extends BasePrimitiveArrayType
 */
class ArrayType extends BasePrimitiveArrayType {
	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof ArrayType
	 * @instance
	 * @override
	 * @param {*[]} record - Data to get values from
	 * @returns {*[]} Array of formatted data values
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
	 */
	get = (record) => {
		const value = this._valueSchemaType.getFromMvData(record);
		return typeof value === 'undefined'
			? []
			: castArray(value).map((itemValue) => this._valueSchemaType.transformFromDb(itemValue));
	};

	/**
	 * Set specified array value into mv record
	 * @function set
	 * @memberof ArrayType
	 * @instance
	 * @override
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*[]} setValue - Array to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this._valueSchemaType.setIntoMvData(
			originalRecord,
			castArray(setValue).map((value) => this._valueSchemaType.transformToDb(value)),
		);

	/**
	 * Validate the array
	 * @function validate
	 * @memberof ArrayType
	 * @instance
	 * @override
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
						.map(
							async ({ validator, message }) => !(await validator(castValue, document)) && message,
						)
						.concat(
							castValue.map(async (arrayItem) =>
								this._valueSchemaType.validate(arrayItem, document),
							),
						),
				),
			),
		);
	};
}

export default ArrayType;
