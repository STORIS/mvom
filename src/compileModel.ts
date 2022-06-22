import type Connection from './Connection';
import type { DocumentConstructorOptions } from './Document';
import Document from './Document';
import { DataValidationError } from './errors';
import type LogHandler from './LogHandler';
import type { QueryConstructorOptions } from './Query';
import Query, { type Filter } from './Query';
import type Schema from './Schema';
import type { DbServerDelimiters, DbSubroutineUserDefinedOptions, GenericObject } from './types';
import { ensureArray } from './utils';

// #region Types
export interface ModelConstructorOptions<TSchema extends GenericObject> {
	_id?: string | null;
	__v?: string | null;
	data?: TSchema;
	record?: string;
}

export type ModelConstructor = ReturnType<typeof compileModel>;

export interface ModelFindAndCountResult {
	/** Number of documents returned */
	count: number;
	/** Model instances for the returned documents */
	documents: InstanceType<ModelConstructor>[];
}

export interface ModelDatabaseExecutionOptions {
	userDefined?: DbSubroutineUserDefinedOptions;
}
export type ModelDeleteByIdOptions = ModelDatabaseExecutionOptions;
export type ModelFindOptions = QueryConstructorOptions & ModelDatabaseExecutionOptions;
export interface ModelFindByIdOptions extends ModelDatabaseExecutionOptions {
	/** Array of projection properties */
	projection?: string[];
}
export type ModelReadFileContentsByIdOptions = ModelDatabaseExecutionOptions;
export type ModelSaveOptions = ModelDatabaseExecutionOptions;
// #endregion

/** Define a new model */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const compileModel = <TSchema extends GenericObject = GenericObject>(
	connection: Connection,
	schema: Schema | null,
	file: string,
	dbServerDelimiters: DbServerDelimiters,
	logHandler: LogHandler,
) => {
	logHandler.log('debug', `creating new model for file ${file}`);

	/** Model constructor */
	return class Model extends Document {
		/** Connection instance which constructed this model definition */
		public static readonly connection = connection;

		/** Database file this model acts against */
		public static readonly file = file;

		/** Schema that defines this model */
		public static readonly schema = schema;

		/** Log handler instance */
		static readonly #logHandler: LogHandler = logHandler;

		/** Database server delimiters */
		static readonly #dbServerDelimiters = dbServerDelimiters;

		/** Document version hash */
		public readonly __v: string | null;

		/** Id of model instance */
		public _id!: string | null; // add definite assignment assertion since property is assigned through defineProperty

		/** Original record string that model was generated from */
		public readonly _originalRecordString: string | null;

		/** Private id tracking property */
		#_id: string | null;

		public constructor(options: ModelConstructorOptions<TSchema>) {
			const { data, record, _id = null, __v = null } = options;

			const mvRecord =
				record != null ? Document.convertMvStringToArray(record, Model.#dbServerDelimiters) : [];

			const documentConstructorOptions: DocumentConstructorOptions = { data, record: mvRecord };
			super(Model.schema, documentConstructorOptions);

			this.#_id = _id;
			this.__v = __v;
			this._originalRecordString = record ?? null;

			Object.defineProperties(this, {
				_id: {
					enumerable: true,
					get: () => this.#_id,
					set: (value) => {
						if (this.#_id != null) {
							throw new Error('_id value cannot be changed once set');
						}

						this.#_id = value;
					},
				},
				_originalRecordString: {
					enumerable: false,
					writable: false,
					configurable: false,
				},
			});

			Model.#logHandler.log('debug', `creating new instance of model for file ${Model.file}`);

			this._transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.#logHandler.log(
					'warn',
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		/** Delete a document */
		public static async deleteById(
			id: string,
			options: ModelDeleteByIdOptions = {},
		): Promise<Model | null> {
			const { userDefined } = options;

			const data = await this.connection.executeDbSubroutine(
				'deleteById',
				{
					filename: this.file,
					id,
				},
				userDefined && { userDefined },
			);

			if (data.result == null) {
				return null;
			}

			const { _id, __v, record } = data.result;

			return this.#createModelFromRecordString(record, _id, __v);
		}

		/** Find documents via query */
		public static async find(
			selectionCriteria: Filter<TSchema> = {},
			options: ModelFindOptions = {},
		): Promise<Model[]> {
			const { userDefined, ...queryConstructorOptions } = options;
			const query = new Query(Model, selectionCriteria, Model.#logHandler, queryConstructorOptions);
			const { documents } = await query.exec(userDefined && { userDefined });

			return documents.map((document) => {
				const { _id, __v, record } = document;
				return this.#createModelFromRecordString(record, _id, __v);
			});
		}

		/** Find documents via query, returning them along with a count */
		public static async findAndCount(
			selectionCriteria: Filter<TSchema> = {},
			options: ModelFindOptions = {},
		): Promise<ModelFindAndCountResult> {
			const { userDefined, ...queryConstructorOptions } = options;
			const query = new Query(Model, selectionCriteria, Model.#logHandler, queryConstructorOptions);
			const { count, documents } = await query.exec(userDefined && { userDefined });

			const models = documents.map((document) => {
				const { _id, __v, record } = document;
				return this.#createModelFromRecordString(record, _id, __v);
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
			const { projection, userDefined } = options;

			const data = await this.connection.executeDbSubroutine(
				'findById',
				{
					filename: this.file,
					id,
					projection: this.#formatProjection(projection),
				},
				userDefined && { userDefined },
			);

			if (data.result == null) {
				return null;
			}

			const { _id, __v, record } = data.result;

			return this.#createModelFromRecordString(record, _id, __v);
		}

		/** Find multiple documents by their ids */
		public static async findByIds(
			ids: string | string[],
			options: ModelFindByIdOptions = {},
		): Promise<(Model | null)[]> {
			const { projection, userDefined } = options;

			const idsArray = ensureArray(ids);
			const data = await this.connection.executeDbSubroutine(
				'findByIds',
				{
					filename: this.file,
					ids: idsArray,
					projection: this.#formatProjection(projection),
				},
				userDefined && { userDefined },
			);

			return data.result.map((dbResultItem) => {
				if (dbResultItem == null) {
					return null;
				}

				const { _id, __v, record } = dbResultItem;
				return new Model({ _id, __v, record });
			});
		}

		/** Read a DIR file type record directly from file system as Base64 string by its id */
		public static async readFileContentsById(
			id: string,
			options: ModelReadFileContentsByIdOptions = {},
		): Promise<string> {
			const { userDefined } = options;
			const data = await this.connection.executeDbSubroutine(
				'readFileContentsById',
				{
					filename: this.file,
					id,
				},
				userDefined && { userDefined },
			);

			return data.result;
		}

		/** Create a new Model instance from a record string */
		static #createModelFromRecordString(
			recordString: string,
			_id: string,
			__v?: string | null,
		): Model {
			return new Model({ _id, __v, record: recordString });
		}

		/** Format projection option */
		static #formatProjection(projection?: string[]): number[] | null {
			return projection != null && this.schema != null
				? this.schema.transformPathsToDbPositions(projection)
				: null;
		}

		/** Save a document to the database */
		public async save(options: ModelSaveOptions = {}): Promise<Model> {
			const { userDefined } = options;
			if (this._id == null) {
				throw new TypeError('_id value must be set prior to saving');
			}

			// validate data prior to saving
			const validationErrors = await this.validate();
			if (validationErrors.size > 0) {
				throw new DataValidationError({ validationErrors });
			}

			try {
				const data = await Model.connection.executeDbSubroutine(
					'save',
					{
						filename: Model.file,
						id: this._id,
						__v: this.__v,
						record: this.#convertToMvString(),
						foreignKeyDefinitions: this.buildForeignKeyDefinitions(),
					},
					userDefined && { userDefined },
				);

				const { _id, __v, record } = data.result;

				return Model.#createModelFromRecordString(record, _id, __v);
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

		/** Convert model instance to multivalue string */
		#convertToMvString(): string {
			const { am, vm, svm } = Model.#dbServerDelimiters;

			const mvRecord = this.transformDocumentToRecord();

			return mvRecord
				.map((attribute) =>
					Array.isArray(attribute)
						? attribute.map((value) => (Array.isArray(value) ? value.join(svm) : value)).join(vm)
						: attribute,
				)
				.join(am);
		}
	};
};

export default compileModel;
