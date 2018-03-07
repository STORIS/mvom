import assignIn from 'lodash/assignIn';
import cloneDeep from 'lodash/cloneDeep';
import getIn from 'lodash/get';
import setIn from 'lodash/set';
import Schema from 'Schema';
import InvalidParameterError from 'Errors/InvalidParameter';
import TransformDataError from 'Errors/TransformData';

/**
 * A document object
 * @class Document
 * @param {Schema} schema - Schema instance to derive document from
 * @param {*[]} [record = []] - Array data to construct document instance properties from
 * @param {Object} [options = {}]
 * @param {Boolean} [options.isSubdocument = false] Indicates whether document should behave as a subdocument
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class Document {
	constructor(schema, record = [], { isSubdocument = false } = {}) {
		if (!(schema instanceof Schema)) {
			throw new InvalidParameterError({ parameterName: 'schema' });
		}
		if (!Array.isArray(record)) {
			throw new InvalidParameterError({ parameterName: 'record' });
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
			/**
			 * Array of any errors which occurred during transformation from the database
			 * @member {TransformDataError[]} transformationErrors
			 * @memberof Document
			 * @instance
			 */
			transformationErrors: {
				value: [],
			},
			transformDocumentToRecord: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
			validate: {
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

	/**
	 * Validate document for errors
	 * @function validate
	 * @memberof Document
	 * @instance
	 * @async
	 * @returns {Promise.<Object>} Object describing any validation errors
	 */
	validate = async () => {
		const documentErrors = {};

		await Promise.all(
			Object.keys(this._schema.paths).map(async keyPath => {
				const value = getIn(this, keyPath, null);
				const errors = await this._schema.paths[keyPath].validate(value, this);
				if (errors.length > 0) {
					documentErrors[keyPath] = errors;
				}
			}),
		);
		return documentErrors;
	};

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
			let setValue;
			try {
				// an instance of a schemaType exists at this._schema.paths[keyPath] which has a get() method
				// to pull data from the record
				setValue = this._schema.paths[keyPath].get(this._record);
			} catch (err) {
				if (err instanceof TransformDataError) {
					// if this was an error in data transformation, set the value to null and add to transformationErrors list
					setValue = null;
					this.transformationErrors.push(err);
				} else {
					// otherwise rethrow any other type of error
					throw err;
				}
			}
			setIn(document, keyPath, setValue);
			return document;
		}, {});
}

export default Document;
