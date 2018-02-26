import Connection from 'Connection';
import Document from 'Document';
import Query from 'Query';
import Schema from 'Schema';

/**
 * Define a new model
 * @function compileModel
 * @package
 * @private
 * @param {Connection} connection - Connection instance to construct model definition from
 * @param {Schema} schema - Schema instance to derive model from
 * @param {string} file - Name of database file associated with model
 * @returns {Model} Model class
 * @throws {Error}
 */
const compileModel = (connection, schema, file) => {
	if (!(connection instanceof Connection)) {
		throw new Error();
	}

	connection.logger.debug(`creating new model for file ${file}`);
	if (!(schema instanceof Schema) || file == null) {
		connection.logger.debug('invalid parameters passed to model compiler');
		throw new Error();
	}

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
		 * Find documents via query
		 * @function find
		 * @memberof Model
		 * @static
		 * @param {Object} [selectionCriteria = {}] - Selection criteria object
		 * @param {Object} [options = {}]
		 * @param {number} [options.skip = 0] - Skip this number of items in the result set
		 * @param {number} [options.limit = null] - Limit the result set to this number of items
		 * @param {Object} [options.sort = {}] - Object keys defining sort criteria; value of 1 indicates ascending and -1 indicates descending
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {Error}
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
		 * @returns {Model} Model instance
		 */
		static findById = async id => {
			const data = await Model.connection.executeDbFeature('findById', {
				filename: Model.file,
				id,
			});

			return new Model(data.result);
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
							throw new Error();
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
				 * @private
				 */
				__v: {
					value: __v,
				},
				save: {
					configurable: false,
					enumerable: false,
					writable: false,
				},
			});

			Model.connection.logger.debug(`creating new instance of model for file ${Model.file}`);
		}

		/**
		 * Save a document to the database
		 * @function save
		 * @memberof Model
		 * @instance
		 * @returns {Model} New instance of the saved model
		 * @throws {Error}
		 */
		save = async () => {
			if (this._id == null) {
				throw new Error();
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
