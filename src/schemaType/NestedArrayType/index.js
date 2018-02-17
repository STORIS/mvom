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
}

export default NestedArrayType;
