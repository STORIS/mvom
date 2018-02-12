import Document from 'Document';
import Schema from 'Schema';
import ComplexType from 'schemaType/ComplexType';

/**
 * An Embedded Schema Type
 * @extends ComplexType
 * @param {Schema} valueSchema - An instance of Schema representing the the document structure embedded contents
 * @throws {Error}
 */
class EmbeddedType extends ComplexType {
	constructor(valueSchema) {
		if (!(valueSchema instanceof Schema)) {
			throw new Error();
		}
		super();

		/**
		 * An instance of Schema representing the the document structure of the array's contents
		 * @member {Schema} _valueSchema
		 * @memberof EmbeddedType
		 * @instance
		 * @private
		 */
		this._valueSchema = valueSchema;
	}

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof EmbeddedType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {Object} Object representing embedded Document structure
	 */
	get = record => ({ ...new Document(this._valueSchema, record) });
}

export default EmbeddedType;
