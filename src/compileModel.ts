import type Connection from './Connection';
import type { DocumentConstructorOptions } from './Document';
import Document from './Document';
import { DataValidationError } from './errors';
import type { QueryConstructorOptions } from './Query';
import Query, { type Filter } from './Query';
import type Schema from './Schema';
import type { GenericObject, MvRecord } from './types';
import { ensureArray } from './utils';

// #region Types
export interface ModelConstructorOptions<TSchema extends GenericObject> {
	_id?: string | null;
	__v?: string | null;
	data?: TSchema;
	record?: MvRecord;
}

export type ModelConstructor = ReturnType<typeof compileModel>;

export interface ModelFindAndCountResult {
	/** Number of documents returned */
	count: number;
	/** Model instances for the returned documents */
	documents: InstanceType<ModelConstructor>[];
}

export interface ModelFindByIdOptions {
	/** Array of projection properties */
	projection?: string[];
}
// #endregion

/** Define a new model */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const compileModel = <TSchema extends GenericObject = GenericObject>(
	connection: Connection,
	schema: Schema | null,
	file: string,
) => {
	connection.logMessage('debug', `creating new model for file ${file}`);

	/** Model constructor */
	return class Model extends Document {
		/** Connection instance which constructed this model definition */
		public static readonly connection = connection;

		/** Database file this model acts against */
		public static readonly file = file;

		/** Schema that defines this model */
		public static readonly schema = schema;

		/** Document version hash */
		public readonly __v: string | null;

		/** Id of model instance */
		public _id!: string | null; // add definite assignment assertion since property is assigned through defineProperty

		/** Private id tracking property */
		#_id: string | null;

		public constructor(options: ModelConstructorOptions<TSchema>) {
			const { data, record, _id = null, __v = null } = options;
			const documentConstructorOptions: DocumentConstructorOptions = { data, record };
			super(Model.schema, documentConstructorOptions);

			this.#_id = _id;
			this.__v = __v;

			Object.defineProperty(this, '_id', {
				enumerable: true,
				get: () => this.#_id,
				set: (value) => {
					if (this.#_id != null) {
						throw new Error('_id value cannot be changed once set');
					}

					this.#_id = value;
				},
			});

			Model.connection.logMessage('debug', `creating new instance of model for file ${Model.file}`);

			this.transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.connection.logMessage(
					'warn',
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		/** Delete a document */
		public static async deleteById(id: string): Promise<Model | null> {
			const data = await Model.connection.executeDbFeature('deleteById', {
				filename: Model.file,
				id,
			});

			if (data.result == null) {
				return null;
			}

			const { _id, __v, record } = data.result;

			return Model.createFromRecordString(record, _id, __v);
		}

		/** Find documents via query */
		public static async find(
			selectionCriteria: Filter<TSchema> = {},
			options: QueryConstructorOptions = {},
		): Promise<Model[]> {
			const query = new Query(Model, selectionCriteria, options);
			const { documents } = await query.exec();

			return documents.map((document) => {
				const { _id, __v, record } = document;
				return Model.createFromRecordString(record, _id, __v);
			});
		}

		/** Find documents via query, returning them along with a count */
		public static async findAndCount(
			selectionCriteria: Filter<TSchema> = {},
			options: QueryConstructorOptions = {},
		): Promise<ModelFindAndCountResult> {
			const query = new Query(Model, selectionCriteria, options);
			const { count, documents } = await query.exec();

			const models = documents.map((document) => {
				const { _id, __v, record } = document;
				return Model.createFromRecordString(record, _id, __v);
			});

			return {
				count,
				documents: models,
			};
		}

		/** Find a document by its id */
		public static async findById(
			id: string,
			options: ModelFindByIdOptions = {},
		): Promise<Model | null> {
			const { projection = [] } = options;
			const data = await Model.connection.executeDbFeature('findById', {
				filename: Model.file,
				id,
				projection: Model.schema?.transformPathsToDbPositions(projection) ?? [],
			});

			if (data.result == null) {
				return null;
			}

			const { _id, __v, record } = data.result;

			return Model.createFromRecordString(record, _id, __v);
		}

		/** Find multiple documents by their ids */
		public static async findByIds(
			ids: string | string[],
			options: ModelFindByIdOptions = {},
		): Promise<(Model | null)[]> {
			const { projection = [] } = options;

			const idsArray = ensureArray(ids);
			const data = await Model.connection.executeDbFeature('findByIds', {
				filename: Model.file,
				ids: idsArray,
				projection: Model.schema?.transformPathsToDbPositions(projection) ?? [],
			});

			return data.result.map((dbResultItem) => {
				if (dbResultItem == null) {
					return null;
				}

				const { _id, __v, record } = dbResultItem;
				return Model.createFromRecordString(record, _id, __v);
			});
		}

		/** Read a DIR file type record directly from file system as Base64 string by its id */
		public static async readFileContentsById(id: string): Promise<string> {
			const data = await Model.connection.executeDbFeature('readFileContentsById', {
				filename: Model.file,
				id,
			});

			return data.result;
		}

		/** Create a new model instance from a record string */
		private static createFromRecordString(
			recordString: string,
			_id: string,
			__v?: string | null,
		): Model {
			const {
				dbServerDelimiters: { am, vm, svm },
			} = Model.connection;

			const record: MvRecord =
				recordString === ''
					? []
					: recordString.split(am).map((attribute) => {
							if (attribute === '') {
								return null;
							}

							const attributeArray = attribute.split(vm);
							if (attributeArray.length === 1) {
								return attribute;
							}

							return attributeArray.map((value) => {
								if (value === '') {
									return null;
								}

								const valueArray = value.split(svm);
								if (valueArray.length === 1) {
									return value;
								}

								return valueArray.map((subvalue) => (subvalue === '' ? null : subvalue));
							});
					  });

			return new Model({ _id, __v, record });
		}

		/** Save a document to the database */
		public async save(): Promise<Model> {
			if (this._id == null) {
				throw new TypeError('_id value must be set prior to saving');
			}

			// validate data prior to saving
			const validationErrors = await this.validate();
			if (validationErrors.size > 0) {
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

				const { _id, __v, record } = data.result;

				return Model.createFromRecordString(record, _id, __v);
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
	};
};

export default compileModel;
