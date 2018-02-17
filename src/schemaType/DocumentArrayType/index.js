import castArray from 'lodash/castArray';
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
	 * @returns {Document[]} An array of subdocuments representing embedded Document structure
	 */

	get = record => [...this._makeSubDocument(record)];

	/**
	 * Generate subdocument instances
	 * @generator
	 * @function _makeSubDocument
	 * @memberof DocumentArrayType
	 * @instance
	 * @private
	 * @param {*[]} record - Data to construct subdocument from
	 * @yields {Document} Subdocument instance
	 */
	*_makeSubDocument(record) {
		const makeSubRecord = iteration =>
			record.reduce((acc, value, index) => {
				const innerValue = castArray(value)[iteration];
				if (typeof innerValue !== 'undefined') {
					acc[index] = innerValue;
				}

				return acc;
			}, []);

		let iteration = 0;
		while (true) {
			const subRecord = makeSubRecord(iteration);
			if (subRecord.length === 0) {
				return;
			}
			yield new Document(this._valueSchema, subRecord);
			iteration += 1;
		}
	}
}

export default DocumentArrayType;
