/* eslint-disable max-classes-per-file */
import { DataValidationError, InvalidParameterError } from '#shared/errors';
import type { GenericObject, MvRecord } from '#shared/types';
import type Connection from './Connection';
import Document from './Document';
import Query from './Query';
import type Schema from './Schema';

export interface ModelConstructorOptionsBase {
	_id?: string | null;
	__v?: string | null;
}
export interface ModelConstructorOptionsData extends ModelConstructorOptionsBase {
	data?: GenericObject;
}

export interface ModelConstructorOptionsRecord extends ModelConstructorOptionsBase {
	record?: MvRecord;
}

export type ModelConstructorOptions = ModelConstructorOptionsData | ModelConstructorOptionsRecord;

/** Define a new model */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const compileModel = (connection: Connection, schema: Schema | null, file: string) => {
	connection.logger.debug(`creating new model for file ${file}`);

	/** Model constructor */
	class Model extends Document {
		/** Connection instance which constructed this model definition */
		public static connection = connection;

		/** Database file this model acts against */
		public static file = file;

		/** Schema that defines this model */
		public static schema = schema;

		public __id: string | null;

		public constructor(options: ModelConstructorOptions = {}) {
			super(Model.schema, options);

			this.__id = _id;

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
			});

			Model.connection.logger.debug(`creating new instance of model for file ${Model.file}`);

			this.transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.connection.logger.warn(
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		public override get _id(): string | null {
			return this.__id;
		}

		public override set _id(value) {
			if (this.__id != null) {
				throw new Error('_id value cannot be changed once set');
			}

			this.__id = value;
		}

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
		public static async deleteById(id: string) {
			const data = await Model.connection.executeDbFeature('deleteById', {
				filename: Model.file,
				id,
			});

			// if the record existed prior to delete then the record prior to delete will be returned;
			// if the record did not exist prior to delete then null will be returned
			return data.result ? Model.makeModelFromDbResult(data.result) : null;
		}

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
		 * @param {Array} [options.projection = []] - Array of projection properties
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		public static async find(selectionCriteria = {}, options = {}) {
			const query = new Query(Model, selectionCriteria, options);
			const { documents } = await query.exec();
			return documents;
		}

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
		 * @param {Array} [options.projection = []] - Array of projection properties
		 * @returns {Promise.<ResultsObject>} Query results object
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		public static findAndCount(selectionCriteria = {}, options = {}) {
			const query = new Query(Model, selectionCriteria, options);
			return query.exec();
		}

		/**
		 * Find a document by its id
		 * @function findById
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string} id - Document identifier
		 * @param {Object} [options = {}]
		 * @param {Array} [options.projection = []] - Array of projection properties
		 * @returns {Promise.<Model>} Model instance
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		public static async findById(id, options = {}) {
			const { projection = [] } = options;
			const data = await Model.connection.executeDbFeature('findById', {
				filename: Model.file,
				id,
				projection: Model.schema?.transformPathsToDbPositions(projection) ?? [],
			});

			// if the database returns a result, instantiate a new model with it -- otherwise return null
			return data.result ? Model.makeModelFromDbResult(data.result) : null;
		}

		/**
		 * Find multiple documents by their ids
		 * @function findByIds
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string|string[]} ids - Array of document identifiers
		 * @param {Object} [options = {}]
		 * @param {Array} [options.projection = []] - Array of projection properties
		 * @returns {Promise.<Model[]>} Array of model instances
		 * @throws {InvalidParameterError} An invalid parameter was passed to the function
		 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
		 * @throws {DbServerError} (indirect) An error occurred on the database server
		 */
		public static async findByIds(ids: string | string[], options = {}) {
			if (ids == null) {
				throw new InvalidParameterError({ parameterName: 'ids' });
			}
			const { projection = [] } = options;

			// this will cast ids to an array in the event only a single id is passed in
			const idsArray = [].concat(ids);
			const data = await Model.connection.executeDbFeature('findByIds', {
				filename: Model.file,
				ids: idsArray,
				projection: Model.schema?.transformPathsToDbPositions(projection) ?? [],
			});

			// returns an array of newly instantiated Models
			// there may be empty strings in the array if a particular document couldn't be found or contained corrupt data
			return data.result.map((dbResultItem) =>
				dbResultItem ? Model.makeModelFromDbResult(dbResultItem) : null,
			);
		}

		/**
		 * Read a DIR file type record directly from file system as Base64 string by its id
		 * @function readFileContentsById
		 * @memberof Model
		 * @static
		 * @async
		 * @param {string} id - Document identifier
		 * @returns {Promise.<String>} Base64 string
		 */
		public static async readFileContentsById(id: string) {
			const data = await Model.connection.executeDbFeature('readFileContentsById', {
				filename: Model.file,
				id,
			});

			// return null if database doesn't returns a result
			return data.result ?? null;
		}

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
		public static makeModelFromDbResult({ record = [], _id = null, __v = null } = {}) {
			const model = new Model({ _id, __v, record });
			return model;
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
		public async save() {
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
					foreignKeyDefinitions: this.buildForeignKeyDefinitions(),
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
		}
	}

	return Model;
};

export default compileModel;
