import Connection from 'Connection';
import Document from 'Document';
import Query from 'Query';
import Schema from 'Schema';
import DataValidationError from 'Errors/DataValidation';
import InvalidParameterError from 'Errors/InvalidParameter';

/**
 * Define a new model
 * @function compileModel
 * @package
 * @private
 * @param {Connection} connection - Connection instance to construct model definition from
 * @param {Schema} schema - Schema instance to derive model from
 * @param {string} file - Name of database file associated with model
 * @returns {Model} Model class
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
const compileModel = (connection, schema, file) => {
	if (!(connection instanceof Connection)) {
		throw new InvalidParameterError({ parameterName: 'connection' });
	}

	if (!(schema instanceof Schema)) {
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
	 * @param {Object} doc - Document
	 * @param {*[]} doc.record - Array data to construct model instance properties from
	 * @param {string} [doc._id = null] - Model instance identifier
	 * @param {uuid} [doc.__v = null] - Record version hash
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
		 * @member {Schema} schema
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
		static deleteById = async id => {
			const data = await Model.connection.executeDbFeature('deleteById', {
				filename: Model.file,
				id,
			});

			// if the record existed prior to delete then the record prior to delete will be returned;
			// if the record did not exist prior to delete then null will be returned
			return data.result ? new Model(data.result) : null;
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
		 * @param {Object} [options.sort = {}] - Object keys defining sort criteria; value of 1 indicates ascending and -1 indicates descending
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		static find = (selectionCriteria = {}, options = {}) => {
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
		static findById = async id => {
			const data = await Model.connection.executeDbFeature('findById', {
				filename: Model.file,
				id,
			});

			// if the database returns a result, instantiate a new model with it -- otherwise return null
			return data.result ? new Model(data.result) : null;
		};

		constructor({ record, _id = null, __v = null } = {}) {
			super(Model.schema, record);

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
					set: value => {
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

			this.transformationErrors.forEach(error => {
				// errors occurred while transforming data from multivalue format - log them
				Model.connection.logger.warn(
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${
						error.transformClass
					}; value: ${error.transformValue}`,
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

			const data = await Model.connection.executeDbFeature('save', {
				filename: Model.file,
				id: this._id,
				__v: this.__v,
				record: this.transformDocumentToRecord(),
			});

			return new Model(data.result);
		};
	}

	return Model;
};

export default compileModel;
