import castArray from 'lodash/castArray';
import ComplexType from 'schemaType/ComplexType';
import SimpleType from 'schemaType/SimpleType';

/**
 * An Array Schema Type
 * @extends ComplexType
 * @param {SimpleType} valueSchemaType - A schemaType representing the type of the array's contents
 * @throws {Error}
 */
class ArrayType extends ComplexType {
	constructor(valueSchemaType) {
		if (!(valueSchemaType instanceof SimpleType)) {
			// array values must be a child of SimpleType class
			throw new Error();
		}
		super();

		/**
		 * A schemaType representing the type of the array's contents
		 * @member {SimpleType} _valueSchemaType
		 * @memberof ArrayType
		 * @instance
		 * @private
		 */
		this._valueSchemaType = valueSchemaType;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof ArrayType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {*[]} Array of formatted data values
	 */
	get = record => {
		const value = this._valueSchemaType.getFromMvData(record);
		return castArray(value).map(itemValue => this._valueSchemaType.transformFromDb(itemValue));
	};
}

export default ArrayType;
