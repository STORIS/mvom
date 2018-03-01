import cloneDeep from 'lodash/cloneDeep';
import setIn from 'lodash/set';
import Document from 'Document';
import Schema from 'Schema';
import ComplexType from 'schemaType/ComplexType';
import getFromMvArray from 'shared/getFromMvArray';
import InvalidParameterError from 'Errors/InvalidParameter';

/**
 * A Document Array Schema Type
 * @extends ComplexType
 * @param {Schema} valueSchema - An instance of Schema representing the the document structure of the array's contents
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class DocumentArrayType extends ComplexType {
	constructor(valueSchema) {
		if (!(valueSchema instanceof Schema)) {
			throw new InvalidParameterError({ parameterName: 'valueSchema' });
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
	 * Set specified document array value into mv record
	 * @function set
	 * @memberof DocumentArrayType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {Document[]} setValue - Array of documents to set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) => {
		const record = cloneDeep(originalRecord);
		setValue.forEach((subdocument, iteration) => {
			const subrecord = subdocument.transformDocumentToRecord();
			subrecord.forEach((value, arrayPos) => {
				if (typeof value !== 'undefined') {
					setIn(record, [arrayPos, iteration], value);
				}
			});
		});
		return record;
	};

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
			this._valueSchema.getMvPaths().reduce((acc, path) => {
				const value = getFromMvArray(record, [path, iteration]);
				if (typeof value !== 'undefined') {
					setIn(acc, path, value);
				}
				return acc;
			}, []);

		let iteration = 0;
		while (true) {
			const subRecord = makeSubRecord(iteration);
			if (subRecord.length === 0) {
				return;
			}
			yield new Document(this._valueSchema, subRecord, { isSubdocument: true });
			iteration += 1;
		}
	}
}

export default DocumentArrayType;
