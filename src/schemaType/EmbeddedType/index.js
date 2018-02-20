import cloneDeep from 'lodash/cloneDeep';
import setIn from 'lodash/set';
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
	 * @returns {Document} Embedded document instance
	 */
	get = record => new Document(this._valueSchema, record, { isSubdocument: true });

	/**
	 * Set specified embedded document value into mv record
	 * @function set
	 * @memberof EmbeddedType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {Document} setValue - Embedded document to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) => {
		const record = cloneDeep(originalRecord);
		const subrecord = setValue.transformDocumentToRecord();
		subrecord.forEach((value, arrayPos) => {
			if (typeof value !== 'undefined') {
				setIn(record, [arrayPos], value);
			}
		});
		return record;
	};
}

export default EmbeddedType;
