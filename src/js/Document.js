import { assignIn, castArray, cloneDeep, get as getIn, isPlainObject, set as setIn } from 'lodash';
import { ForeignKeyDbTransformer } from '#shared/classes';
import { InvalidParameterError, TransformDataError } from '#shared/errors';

/**
 * A document object
 * @class Document
 * @param {Schema | null} schema - Schema instance to derive document from, null indicates the entire record is being used
 * @param {Object} [options = {}]
 * @param {Object} [options.data = {}] - Object to construct document instance from
 * @param {Boolean} [options.isSubdocument = false] Indicates whether document should behave as a subdocument
 * @param {(( string | null ) | (string | null)[] | (string | null)[][])[]} [options.record] - Array of raw record data to initialize the document with
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class Document {
	constructor(schema, { data = {}, isSubdocument = false, record } = {}) {
		if (!isPlainObject(data)) {
			throw new InvalidParameterError({ parameterName: 'data' });
		}

		Object.defineProperties(this, {
			/**
			 * Schema instance which defined this document
			 * @member {Schema | null} _schema
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
			buildForeignKeyDefinitions: {
				configurable: false,
				enumerable: false,
				writable: false,
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
			validate: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
		});

		if (record != null) {
			this._transformRecordToDocument(record);
		}
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
		this._schema === null
			? getIn(this, '_raw', [])
			: Object.entries(this._schema.paths).reduce(
					(record, [keyPath, schemaType]) => {
						const value = getIn(this, keyPath, null);
						return schemaType.set(record, value);
					},
					this._isSubdocument ? [] : cloneDeep(this._record),
			  );

	/**
	 * Build a list of foreign key definitions to be used by the database for foreign key validation
	 * @function buildForeignKeyDefinitions
	 * @memberof Document
	 * @instance
	 * @returns {*[]} Array of database foreign key definitions
	 */
	buildForeignKeyDefinitions = () => {
		if (this._schema === null) {
			return [];
		}

		// U2 does not allow commas in filenames so we can use it to separate filename/entityName combinations
		const separator = ',';
		const definitionMap = Object.entries(this._schema.paths).reduce(
			(foreignKeyDefinitions, [keyPath, schemaType]) => {
				const value = getIn(this, keyPath, null);
				const definitions = schemaType.transformForeignKeyDefinitionsToDb(value);
				// Deduplicate foreign key definitions by using a filename / entity name combination
				// We could deduplicate using just the filename but ignoring the entity name could result in confusing error messages
				definitions.forEach(({ filename, entityIds, entityName }) => {
					const key = `${filename}${separator}${entityName}`;
					// TODO - switch to null-coalescing operator in node 14
					const accumulatedEntityIds = foreignKeyDefinitions.get(key) || new Set();
					// For array types we may need to validated multiple foreign keys
					accumulatedEntityIds.add(...castArray(entityIds));
					foreignKeyDefinitions.set(key, accumulatedEntityIds);
				});

				return foreignKeyDefinitions;
			},
			new Map(),
		);

		if (this._schema.idForeignKey != null) {
			const foreignKeyDbTransformer = new ForeignKeyDbTransformer(this._schema.idForeignKey);
			const definitions = foreignKeyDbTransformer.transform(this._id);
			definitions.forEach(({ filename, entityIds, entityName }) => {
				const key = `${filename}${separator}${entityName}`;
				const accumulatedEntityIds = definitionMap.get(key) || new Set();
				accumulatedEntityIds.add(entityIds);
				definitionMap.set(key, accumulatedEntityIds);
			});
		}

		return Array.from(definitionMap).reduce((acc, [key, value]) => {
			const keyParts = key.split(separator);
			const filename = keyParts[0];
			// Just incase the entity name included a comma, rejoin
			const entityName = keyParts.slice(1).join(separator);
			acc.push({ filename, entityName, entityIds: Array.from(value) });
			return acc;
		}, []);
	};

	/**
	 * Apply schema structure using record to document instance
	 * @function transformRecordToDocument
	 * @memberof Document
	 * @instance
	 * @private
	 * @param {*[]} record - Array data to construct document instance properties from
	 * @modifies {this}
	 */
	_transformRecordToDocument = (record) => {
		if (!Array.isArray(record)) {
			throw new InvalidParameterError({ parameterName: 'record' });
		}

		// hold on to the original to use as the baseline when saving
		this._record = record;

		const plainDocument =
			this._schema === null
				? { _raw: this._record }
				: Object.entries(this._schema.paths).reduce((document, [keyPath, schemaType]) => {
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
				  }, {});

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

		if (this._schema !== null) {
			if (this._schema.idMatch != null && !this._schema.idMatch.test(this._id)) {
				documentErrors._id = 'Document id does not match pattern';
			}
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
		}
		return documentErrors;
	};
}

export default Document;
