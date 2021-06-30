import { DataValidationError, InvalidParameterError } from '#shared/errors';
import Document from './Document';
import Query from './Query';
import Schema from './Schema';

/**
 * Define a new model
 * @function compileModel
 * @package
 * @private
 * @param {Connection} connection - Connection instance to construct model definition from
 * @param {Schema | null} schema - Schema instance to derive model from, null indicates the entire record is being used
 * @param {string} file - Name of database file associated with model
 * @returns {Model} Model class
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
const compileModel = (connection, schema, file) => {
	if (!(schema instanceof Schema) && schema !== null) {
		throw new InvalidParameterError({ parameterName: 'schema' });
	}

	if (file == null) {
		throw new InvalidParameterError({ parameterName: 'file' });
	}

	connection.logger.debug(`creating new model for file ${file}`);

	/**
	 * Construct a document instance of a compiled model
	 * @class Model
	 * @extends Document
	 * @param {Object} options
	 * @param {string} [options._id = null] - Model instance identifier
	 * @param {uuid} [options.__v = null] - Record version hash
	 * @param {Object} [options.data = {}] - Object to construct model instance from
	 * @param {(( string | null ) | (string | null)[] | (string | null)[][])[]} [options.record] - Array of raw record data to initialize the model with
	 */
	class Model extends Document {
		/* static properties */

		/**
		 * Connection instance which constructed this model defininition
		 * @member {Connection} connection
		 * @memberof Model
		 * @static
		 */
		static connection = connection;

		/**
		 * Database file this model acts against
		 * @member {string} file
		 * @memberof Model
		 * @static
		 */
		static file = file;

		/**
		 * Schema that defines this model
		 * @member {Schema | null} schema
		 * @memberof Model
		 * @static
		 */
		static schema = schema;

		/* static methods */

		/**
		 * Delete a document
		 * @function deleteById
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string} id - Document identifier
		 * @returns {Promise.<Model|null>} Model representing document prior to deletion or null if document did not exist
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static deleteById = async (id) => {
			const data = await Model.connection.executeDbFeature('deleteById', {
				filename: Model.file,
				id,
			});

			// if the record existed prior to delete then the record prior to delete will be returned;
			// if the record did not exist prior to delete then null will be returned
			return data.result ? Model.makeModelFromDbResult(data.result) : null;
		};

		/**
		 * Find documents via query
		 * @function find
		 * @memberof Model
		 * @static
		 * @async
		 * @param {Object} [selectionCriteria = {}] - Selection criteria object
		 * @param {Object} [options = {}]
		 * @param {number} [options.skip = 0] - Skip this number of items in the result set
		 * @param {number} [options.limit = null] - Limit the result set to this number of items
		 * @param {Array} [options.sort = []] - Array of field/direction nested arrays defining sort criteria. ex: [[foo, 1], [bar, -1]] where value of 1 indicates ascending and -1 indicates descending
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static find = async (selectionCriteria = {}, options = {}) => {
			const query = new Query(Model, selectionCriteria, options);
			const { documents } = await query.exec();
			return documents;
		};

		/**
		 * Find documents via query, returning them along with a count
		 * @function findAndCount
		 * @memberof Model
		 * @static
		 * @async
		 * @param {Object} [selectionCriteria = {}] - Selection criteria object
		 * @param {Object} [options = {}]
		 * @param {number} [options.skip = 0] - Skip this number of items in the result set
		 * @param {number} [options.limit = null] - Limit the result set to this number of items
		 * @param {Array} [options.sort = []] - Array of field/direction nested arrays defining sort criteria. ex: [[foo, 1], [bar, -1]] where value of 1 indicates ascending and -1 indicates descending
		 * @returns {Promise.<ResultsObject>} Query results object
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static findAndCount = (selectionCriteria = {}, options = {}) => {
			const query = new Query(Model, selectionCriteria, options);
			return query.exec();
		};

		/**
		 * Find a document by its id
		 * @function findById
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string} id - Document identifier
		 * @returns {Promise.<Model>} Model instance
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static findById = async (id) => {
			const data = await Model.connection.executeDbFeature('findById', {
				filename: Model.file,
				id,
			});

			// if the database returns a result, instantiate a new model with it -- otherwise return null
			return data.result ? Model.makeModelFromDbResult(data.result) : null;
		};

		/**
		 * Find multiple documents by their ids
		 * @function findByIds
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string|string[]} ids - Array of document identifiers
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {InvalidParameterError} An invalid parameter was passed to the function
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static findByIds = async (ids) => {
			if (ids == null) {
				throw new InvalidParameterError({ parameterName: 'ids' });
			}
			// this will cast ids to an array in the event only a single id is passed in
			const idsArray = [].concat(ids);
			const data = await Model.connection.executeDbFeature('findByIds', {
				filename: Model.file,
				ids: idsArray,
			});

			// returns an array of newly instantiated Models
			// there may be empty strings in the array if a particular document couldn't be found or contained corrupt data
			return data.result.map((dbResultItem) =>
				dbResultItem ? Model.makeModelFromDbResult(dbResultItem) : null,
			);
		};

		/**
		 * Create a new model instance from the result of a database feature execution
		 * @function makeModelFromDbResult
		 * @memberof Model
		 * @static
		 * @param {Object} [dbResult = {}] - Result property returned from database feature execution
		 * @param {*[]} [dbResult.record = []] Array data to construct document instance properties from
		 * @param {string} [dbResult._id = null] - Model instance identifier
		 * @param {uuid} [dbResult.__v = null] - Record version hash
		 * @returns {Model} Model instance
		 */
		static makeModelFromDbResult = ({ record = [], _id = null, __v = null } = {}) => {
			const model = new Model({ _id, __v, record });
			return model;
		};

		constructor({ _id = null, __v = null, data = {}, record } = {}) {
			super(Model.schema, { data, record });

			Object.defineProperties(this, {
				/**
				 * Public id of model instance
				 * @member {string} _id
				 * @memberof Model
				 * @instance
				 * @public
				 */
				_id: {
					enumerable: true,
					get: () => this.__id,
					set: (value) => {
						if (this.__id != null) {
							throw new Error('_id value cannot be changed once set');
						}
						this.__id = value;
					},
				},
				/**
				 * Private id of model instance
				 * @member {string} __id
				 * @memberof Model
				 * @instance
				 * @private
				 */
				__id: {
					value: _id,
					writable: true,
				},
				/**
				 * Version hash of model instance
				 * @member {uuid} __v
				 * @memberof Model
				 * @instance
				 * @public
				 */
				__v: {
					value: __v,
					enumerable: true,
				},
				save: {
					configurable: false,
					enumerable: false,
					writable: false,
				},
			});

			Model.connection.logger.debug(`creating new instance of model for file ${Model.file}`);

			this.transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.connection.logger.warn(
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		/**
		 * Save a document to the database
		 * @function save
		 * @memberof Model
		 * @instance
		 * @async
		 * @returns {Promise.<Model>} New instance of the saved model
		 * @throws {DataValidationError} Error(s) found during data validation
		 * @throws {TypeError} _id value was not set prior to calling the function
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 * @throws {RecordLockedError} (indirect) The record was locked which prevented update
		 * @throws {RecordVersionError} (indirect) The record changed after reading which prevented update
		 */
		save = async () => {
			if (this._id == null) {
				throw new TypeError('_id value must be set prior to saving');
			}

			// validate data prior to saving
			const validationErrors = await this.validate();
			if (Object.keys(validationErrors).length) {
				throw new DataValidationError({ validationErrors });
			}

			try {
				const data = await Model.connection.executeDbFeature('save', {
					filename: Model.file,
					id: this._id,
					__v: this.__v,
					record: this.transformDocumentToRecord(),
					clearAttributes: Model.schema === null, // clears all attributes before writing new record
				});
				return Model.makeModelFromDbResult(data.result);
			} catch (err) {
				// enrich caught error object with additional information and rethrow
				err.other = {
					...err.other, // ensure properties are not lost in the event the "other" object existed previously
					filename: Model.file,
					_id: this._id,
				};

				throw err;
			}
		};
	}

	return Model;
};

export default compileModel;
