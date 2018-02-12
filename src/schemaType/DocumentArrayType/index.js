import castArray from 'lodash/castArray';
import isPlainObject from 'lodash/isPlainObject';
import Document from 'Document';
import Schema from 'Schema';
import ComplexType from 'schemaType/ComplexType';

/**
 * A Document Array Schema Type
 * @extends ComplexType
 * @param {Schema} valueSchema - An instance of Schema representing the the document structure of the array's contents
 * @throws {Error}
 */
class DocumentArrayType extends ComplexType {
	/* static methods */

	/**
	 * Convert an object containing properties which are arrays to an array of objects
	 * @function objArrayToArrayObj
	 * @memberof DocumentArrayType
	 * @static
	 * @private
	 * @param {Object} obj - Object to convert
	 * @returns {Object[]} Array of objects
	 * @example
	 * // returns [ { propertyA: 'foo' }, { propertyA: 'bar'} ]
	 * DocumentArrayType.objArrayToArrayObj({ propertyA: ['foo', 'bar'] });
	 * @example
	 * // returns [ { propertyA: [{ propertyB: 'foo' }, { propertyB: 'bar' }] }, { propertyA: [{ propertyB: 'baz' }, { propertyB: 'qux' }] } ]
	 * DocumentArrayType.objArrayToArrayObj({ propertyA: [{ propertyB: ['foo', 'bar'] }, { propertyB: ['baz', 'qux'] }] });
	 */
	static objArrayToArrayObj = obj =>
		// each property of the object is anticipated to logically represent an array of data
		// the object's arrayed properties will be transformed into an array of objects with the
		//   arrayed values being "exploded" into a new object
		// if the arrayed properties are themselves objects, they will need to be recursively "exploded" as well
		Object.keys(obj).reduce((acc, key) => {
			const propertyVal = castArray(obj[key]);
			propertyVal.forEach((arrayVal, idx) => {
				acc[idx] = acc[idx] == null ? {} : acc[idx]; // define if first use of this array index

				if (isPlainObject(arrayVal)) {
					// recursively explode object's properties
					acc[idx][key] = DocumentArrayType.objArrayToArrayObj(arrayVal);
					return;
				}

				acc[idx][key] = arrayVal;
			});
			return acc;
		}, []);

	constructor(valueSchema) {
		if (!(valueSchema instanceof Schema)) {
			throw new Error();
		}

		super();
		/**
		 * An instance of Schema representing the the document structure of the array's contents
		 * @member {Schema} _valueSchema
		 * @memberof DocumentArrayType
		 * @instance
		 * @private
		 */
		this._valueSchema = valueSchema;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof DocumentArrayType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {Object[]} An array of objects representing embedded Document structure
	 */
	get = record => DocumentArrayType.objArrayToArrayObj(new Document(this._valueSchema, record));
}

export default DocumentArrayType;
