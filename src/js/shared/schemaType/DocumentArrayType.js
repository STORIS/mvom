import { castArray, cloneDeep, compact, isPlainObject, set as setIn } from 'lodash';
import { getFromMvArray } from '#shared/utils';
import Document from '../../Document';
import ComplexType from './ComplexType';

/**
 * A Document Array Schema Type
 * @extends ComplexType
 * @param {Schema} valueSchema - An instance of Schema representing the the document structure of the array's contents
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class DocumentArrayType extends ComplexType {
	constructor(valueSchema) {
		super();
		/**
		 * An instance of Schema representing the document structure of the array's contents
		 * @member {Schema} _valueSchema
		 * @memberof DocumentArrayType
		 * @instance
		 * @private
		 */
		this._valueSchema = valueSchema;
	}

	/* public instance methods */

	/**
	 * Cast to array of documents
	 * @function cast
	 * @memberof DocumentArrayType
	 * @override
	 * @instance
	 * @param {*} value - Value to cast
	 * @returns {Document[]} An array of subdocuments representing embedded Document structure
	 * @throws {TypeError} Throws if a non-null/non-object is passed
	 */
	cast = (value) => {
		if (value == null) {
			return [];
		}

		return castArray(value).map((subdocument) => {
			// convert subdocument to a plain structure and then recast as document
			const plainValue = subdocument == null ? {} : JSON.parse(JSON.stringify(subdocument));
			if (!isPlainObject(plainValue)) {
				throw new TypeError('Cast value must be an object');
			}
			return new Document(this._valueSchema, { data: plainValue, isSubdocument: true });
		});
	};

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof DocumentArrayType
	 * @instance
	 * @param {*[]} record - Data to get values from
	 * @returns {Document[]} An array of subdocuments representing embedded Document structure
	 */

	get = (record) => [...this._makeSubDocument(record)];

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
		// A subdocumentArray is always overwritten entirely so clear out all associated fields
		this._valueSchema.getMvPaths().forEach((path) => {
			setIn(record, path, null);
		});
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
	 * Validate the document array
	 * @function validate
	 * @memberof DocumentArrayType
	 * @instance
	 * @async
	 * @param {Document[]} documentList - Array of documents to validate
	 * @returns {Promise.<Object[]>} List of errors found while validating
	 */
	validate = async (documentList) =>
		// combining all the validation into one array of promise.all
		// - validation against the documents in the array will return a single object with 0 to n keys - only those with keys indicate errors;
		//   if there are errors then the promise will resolve with the error object; otherwise it will resolve with 0
		// - compact the array of resolved promises to remove any falsy values
		compact(
			await Promise.all(
				documentList.map(async (document) => {
					const documentErrors = await document.validate();
					return Object.keys(documentErrors).length && documentErrors;
				}),
			),
		);

	/**
	 * Create an array of foreign key definitions that will be validated before save
	 * @function transformForeignKeyDefinitionsToDb
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @param {Document[]} documentList - Array of documents to build foreign key validation definitions for
	 * @returns {*[]} Array of foreign key definitions
	 */
	transformForeignKeyDefinitionsToDb = (documentList) =>
		documentList.map((document) => document.buildForeignKeyDefinitions()).flat();

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
		const makeSubRecord = (iteration) =>
			this._valueSchema.getMvPaths().reduce((acc, path) => {
				const value = getFromMvArray(record, path.concat([iteration]));
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
			const subdocument = new Document(this._valueSchema, {
				isSubdocument: true,
				record: subRecord,
			});
			yield subdocument;
			iteration += 1;
		}
	}
}

export default DocumentArrayType;
