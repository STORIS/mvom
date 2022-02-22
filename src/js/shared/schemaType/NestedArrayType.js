import { castArray, compact } from 'lodash';
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
	get = (record) => {
		const value = this._valueSchemaType.getFromMvData(record);
		return typeof value === 'undefined'
			? []
			: castArray(value).map((itemValue) =>
					castArray(itemValue).map((nestedValue) =>
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
			castArray(setValue).map((value) =>
				castArray(value).map((nestedValue) => this._valueSchemaType.transformToDb(nestedValue)),
			),
		);

	/**
	 * Create an array of foreign key definitions that will be validated before save
	 * @function transformForeignKeyDefinitionsToDb
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @param {Array.<Array.<*>>} value - Nested foreign key values which will be checked against the foreign file
	 * @returns {*[]} Array of foreign key definitions
	 */
	transformForeignKeyDefinitionsToDb = (value) =>
		castArray(value)
			.flat(Infinity)
			.map((nestedValue) => this._valueSchemaType.transformForeignKeyDefinitionsToDb(nestedValue))
			.flat();

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
			(
				await Promise.all(
					this._validators
						.map(
							async ({ validator, message }) => !(await validator(castValue, document)) && message,
						)
						.concat(
							castValue
								.flat()
								.map(async (arrayItem) => this._valueSchemaType.validate(arrayItem, document)),
						),
				)
			).flat(),
		);
	};
}

export default NestedArrayType;
