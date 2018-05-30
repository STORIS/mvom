import assignIn from 'lodash/assignIn';
import cloneDeep from 'lodash/cloneDeep';
import getIn from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import setIn from 'lodash/set';
import Schema from 'Schema';
import InvalidParameterError from 'Errors/InvalidParameter';
import TransformDataError from 'Errors/TransformData';

/**
 * A document object
 * @class Document
 * @param {Schema} schema - Schema instance to derive document from
 * @param {Object} [data = {}] - Object to construct document instance from
 * @param {Object} [options = {}]
 * @param {Boolean} [options.isSubdocument = false] Indicates whether document should behave as a subdocument
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class Document {
	constructor(schema, data = {}, { isSubdocument = false } = {}) {
		if (!(schema instanceof Schema)) {
			throw new InvalidParameterError({ parameterName: 'schema' });
		}
		if (!isPlainObject(data)) {
			throw new InvalidParameterError({ parameterName: 'data' });
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
				value: [],
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
			transformDocumentToRecord: {},
			transformRecordToDocument: {},
			validate: {},
		});

		// load the data passed to constructor into document instance
		assignIn(this, data);
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
		Object.entries(this._schema.paths).reduce((record, [keyPath, schemaType]) => {
			const value = getIn(this, keyPath, null);
			return schemaType.set(record, value);
		}, this._isSubdocument ? [] : cloneDeep(this._record));

	/**
	 * Apply schema structure using record to document instance
	 * @function transformRecordToDocument
	 * @memberof Document
	 * @instance
	 * @param {*[]} record - Array data to construct document instance properties from
	 * @modifies {this}
	 */
	transformRecordToDocument = record => {
		if (!Array.isArray(record)) {
			throw new InvalidParameterError({ parameterName: 'record' });
		}

		// hold on to the original to use as the baseline when saving
		this._record = record;

		const plainDocument = Object.entries(this._schema.paths).reduce(
			(document, [keyPath, schemaType]) => {
				let setValue;
				try {
					setValue = schemaType.get(this._record);
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
			},
			{},
		);

		assignIn(this, plainDocument);
	};

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
			Object.entries(this._schema.paths).map(async ([keyPath, schemaType]) => {
				let value = getIn(this, keyPath, null);
				// cast to complex data type if necessary
				try {
					value = schemaType.cast(value);
					setIn(this, keyPath, value);

					const errors = await schemaType.validate(value, this);
					if (errors.length > 0) {
						documentErrors[keyPath] = errors;
					}
				} catch (err) {
					// an error was thrown - return the message from that error in the documentErrors list
					documentErrors[keyPath] = err.message;
				}
			}),
		);
		return documentErrors;
	};
}

export default Document;
