import castArray from 'lodash/castArray';
import ComplexType from 'schemaType/ComplexType';
import SimpleType from 'schemaType/SimpleType';

/**
 * A Nested Array Schema Type
 * @extends ComplexType
 * @param {SimpleType} valueSchemaType - A schemaType representing the type of the child array's contents
 * @throws {Error}
 */
class NestedArrayType extends ComplexType {
	constructor(valueSchemaType) {
		if (!(valueSchemaType instanceof SimpleType)) {
			// array values must be a child of SimpleType class
			throw new Error();
		}
		super();

		/**
		 * A schemaType representing the type of the child array's contents
		 * @member {SimpleType} _valueSchemaType
		 * @memberof NestedArrayType
		 * @instance
		 * @private
		 */
		this._valueSchemaType = valueSchemaType;
	}

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof NestedArrayType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {Array.<Array.<*>>} Nested array of formatted data values
	 */
	get = record => {
		const value = this._valueSchemaType.getFromMvData(record);
		return castArray(value).map(itemValue =>
			castArray(itemValue).map(nestedValue => this._valueSchemaType.transformFromDb(nestedValue)),
		);
	};

	/**
	 * Set specified nested array value into mv record
	 * @function set
	 * @memberof NestedArrayType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {Array.<Array.<*>>} setValue - Nested array to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this._valueSchemaType.setIntoMvData(
			originalRecord,
			setValue.map(value =>
				value.map(nestedValue => this._valueSchemaType.transformToDb(nestedValue)),
			),
		);
}

export default NestedArrayType;
