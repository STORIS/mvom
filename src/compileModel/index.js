import Connection from 'Connection';
import Document from 'Document';
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
		/* static methods */
		/**
		 * Find a document by it's id
		 * @function findById
		 * @memberof Model
		 * @static
		 * @param {string} id - Document identifier
		 * @returns {Model} Model instance
		 */
		static findById = async id => {
			const data = await connection.executeDbFeature('findById', {
				filename: file,
				id,
			});

			return new Model(data.result);
		};

		constructor({ record, _id = null, __v = null } = {}) {
			super(schema, record);

			Object.defineProperties(this, {
				/**
				 * Connection instance which constructed this model defininition
				 * @member {Connection} _connection
				 * @memberof Model
				 * @instance
				 * @private
				 */
				_connection: {
					value: connection,
				},
				/**
				 * Database file this model acts against
				 * @member {string} _file
				 * @memberof Model
				 * @instance
				 * @private
				 */
				_file: {
					value: file,
				},
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
			});

			this._connection.logger.debug(`creating new instance of model for file ${this._file}`);
		}
	}

	return Model;
};

export default compileModel;
