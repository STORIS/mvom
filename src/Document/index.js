import assignIn from 'lodash/assignIn';
import set from 'lodash/set';
import Schema from 'Schema';

/**
 * A document object
 * @class Document
 * @param {Schema} schema - Schema instance to derive document from
 * @param {*[]} record - Array data to construct document instance properties from
 * @throws {Error}
 */
class Document {
	constructor(schema, record) {
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
			_applySchemaToRecord: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
		});

		assignIn(this, this._applySchemaToRecord());
	}

	/* private instance methods */

	/**
	 * Apply schema structure against data
	 * @function _applySchemaToRecord
	 * @memberof Document
	 * @instance
	 * @private
	 * @returns {Object} Object created by applying schema to record
	 */
	_applySchemaToRecord = () =>
		Object.keys(this._schema.paths).reduce((document, keyPath) => {
			// an instance of a schemaType exists at this._schema.paths[keyPath] which has a get() method
			// to pull data from the record
			set(document, keyPath, this._schema.paths[keyPath].get(this._record));
			return document;
		}, {});
}

export default Document;
