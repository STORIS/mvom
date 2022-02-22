import { cloneDeep, isPlainObject, set as setIn } from 'lodash';
import Document from '../../Document';
import ComplexType from './ComplexType';

/**
 * An Embedded Schema Type
 * @extends ComplexType
 * @param {Schema} valueSchema - An instance of Schema representing the the document structure embedded contents
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class EmbeddedType extends ComplexType {
	constructor(valueSchema) {
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
	 * Cast to embedded data type
	 * @function cast
	 * @memberof EmbeddedType
	 * @override
	 * @instance
	 * @param {*} value - Value to cast
	 * @returns {Document} Embedded document instance
	 * @throws {TypeError} Throws if a non-null/non-object is passed
	 */
	cast = (value) => {
		// convert value to a plain structure and then recast as embedded document
		const plainValue = value == null ? {} : JSON.parse(JSON.stringify(value));
		if (!isPlainObject(plainValue)) {
			throw new TypeError('Cast value must be an object');
		}
		return new Document(this._valueSchema, { data: plainValue, isSubdocument: true });
	};

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof EmbeddedType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {Document} Embedded document instance
	 */
	get = (record) => {
		const embeddedDocument = new Document(this._valueSchema, { isSubdocument: true, record });
		return embeddedDocument;
	};

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

	/**
	 * Validate the embedded document
	 * @function validate
	 * @memberof EmbeddedType
	 * @instance
	 * @async
	 * @param {Document} document - Document to validate
	 * @returns {Promise.<Object[]>} List of errors found while validating
	 */
	validate = async (document) => {
		// - validation against the embedded document will return a single object with 0 to n keys - only those with keys indicate errors;
		// - if there are errors then return an array with the error object; otherwise return an empty array
		const documentErrors = await document.validate();
		return Object.keys(documentErrors).length ? [documentErrors] : [];
	};
}

export default EmbeddedType;
