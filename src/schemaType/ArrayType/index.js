import castArray from 'lodash/castArray';
import ComplexType from 'schemaType/ComplexType';
import SimpleType from 'schemaType/SimpleType';
import InvalidParameterError from 'Errors/InvalidParameter';

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
	 * @throws {TypeError} (indirect) Could not cast value to number
	 */
	set = (originalRecord, setValue) =>
		this._valueSchemaType.setIntoMvData(
			originalRecord,
			setValue.map(value => this._valueSchemaType.transformToDb(value)),
		);
}

export default ArrayType;
