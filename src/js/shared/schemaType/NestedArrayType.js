import { castArray, compact, flatten } from 'lodash';
import { handleRequiredValidation } from '#shared/utils';
import BasePrimitiveArrayType from './BasePrimitiveArrayType';

/**
 * A Nested Array Schema Type
 * @extends BasePrimitiveArrayType
 */
class NestedArrayType extends BasePrimitiveArrayType {
	/**
	 * Get value from mv data
	 * @function get
	 * @memberof NestedArrayType
	 * @instance
	 * @override
	 * @param {*[]} record - Data to get values from
	 * @returns {Array.<Array.<*>>} Nested array of formatted data values
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
	 */
	get = record => {
		const value = this._valueSchemaType.getFromMvData(record);
		return typeof value === 'undefined'
			? []
			: castArray(value).map(itemValue =>
					castArray(itemValue).map(nestedValue =>
						this._valueSchemaType.transformFromDb(nestedValue),
					),
			  );
	};

	/**
	 * Set specified nested array value into mv record
	 * @function set
	 * @memberof NestedArrayType
	 * @instance
	 * @override
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {Array.<Array.<*>>} setValue - Nested array to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this._valueSchemaType.setIntoMvData(
			originalRecord,
			castArray(setValue).map(value =>
				castArray(value).map(nestedValue => this._valueSchemaType.transformToDb(nestedValue)),
			),
		);

	/**
	 * Validate the nested array
	 * @function validate
	 * @memberof NestedArrayType
	 * @instance
	 * @override
	 * @async
	 * @param {Array.<Array.<*>>} value - Nested array to validate
	 * @param {Document} document - Document object
	 * @returns {Promise.<string[]>} List of errors found while validating
	 */
	validate = async (value, document) => {
		const castValue = castArray(value);

		// combining all the validation into one array of promise.all
		// - validation against the values in the array will return an array of 0 to n errors for each value
		//   the array values were flattened prior to validation to easily validate each value
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
							flatten(castValue).map(async arrayItem =>
								this._valueSchemaType.validate(arrayItem, document),
							),
						),
				),
			),
		);
	};
}

export default NestedArrayType;
