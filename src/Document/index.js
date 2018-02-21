import assignIn from 'lodash/assignIn';
import cloneDeep from 'lodash/cloneDeep';
import getIn from 'lodash/get';
import setIn from 'lodash/set';
import Schema from 'Schema';

/**
 * A document object
 * @class Document
 * @param {Schema} schema - Schema instance to derive document from
 * @param {*[]} [record = []] - Array data to construct document instance properties from
 * @param {Object} [options = {}]
 * @param {Boolean} [options.isSubdocument = false] Indicates whether document should behave as a subdocument
 * @throws {Error}
 */
class Document {
	constructor(schema, record = [], { isSubdocument = false } = {}) {
		if (!(schema instanceof Schema) || !Array.isArray(record)) {
			throw new Error();
		}
		Object.defineProperties(this, {
			/**
			 * Schema instance which defined this document
			 * @member {Schema} _schema
			 * @memberof Document
			 * @instance
			 * @private
			 */
			_schema: {
				value: schema,
			},
			/**
			 * Record array of multivalue data
			 * @member {*[]} _record
			 * @memberof Document
			 * @instance
			 * @private
			 */
			_record: {
				value: record,
				writable: true,
			},
			/**
			 * Indicates whether this document is a subdocument of a composing parent
			 * @member {Boolean} _isSubdocument
			 * @memberof Document
			 * @instance
			 * @private
			 */
			_isSubdocument: {
				value: isSubdocument,
			},
			transformDocumentToRecord: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
			_transformRecordToDocument: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
		});

		assignIn(this, this._transformRecordToDocument());
	}

	/* public instance methods */

	/**
	 * Transform document structure to multivalue array structure
	 * @function transformDocumentToRecord
	 * @memberof Document
	 * @instance
	 * @returns {*[]} Array data of output record format
	 */
	transformDocumentToRecord = () =>
		Object.keys(this._schema.paths).reduce((record, keyPath) => {
			const value = getIn(this, keyPath, null);
			return this._schema.paths[keyPath].set(record, value);
		}, this._isSubdocument ? [] : cloneDeep(this._record));

	/* private instance methods */

	/**
	 * Apply schema structure against data
	 * @function _transformRecordToDocument
	 * @memberof Document
	 * @instance
	 * @private
	 * @returns {Object} Object created by applying schema to record
	 */
	_transformRecordToDocument = () =>
		Object.keys(this._schema.paths).reduce((document, keyPath) => {
			// an instance of a schemaType exists at this._schema.paths[keyPath] which has a get() method
			// to pull data from the record
			setIn(document, keyPath, this._schema.paths[keyPath].get(this._record));
			return document;
		}, {});
}

export default Document;
