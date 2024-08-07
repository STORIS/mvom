import type Connection from './Connection';
import type { DocumentConstructorOptions, DocumentData } from './Document';
import Document from './Document';
import { DataValidationError } from './errors';
import type LogHandler from './LogHandler';
import Query, { type Filter, type QueryConstructorOptions } from './Query';
import type Schema from './Schema';
import type { FlattenDocument, InferModelObject, SchemaDefinition } from './Schema';
import type { SchemaTypeDefinitionNumber } from './schemaType';
import type {
	DbServerDelimiters,
	DbSubroutineInputIncrementOperation,
	DbSubroutineUserDefinedOptions,
} from './types';
import { ensureArray } from './utils';

// #region Types
export interface ModelConstructorOptions<TSchema extends Schema | null> {
	_id?: string | null;
	__v?: string | null;
	data?: DocumentData<TSchema>;
	record?: string;
}

export type ModelConstructor<TSchema extends Schema | null> = ReturnType<
	typeof compileModel<TSchema>
>;

export type Model<TSchema extends Schema | null> = InstanceType<ModelConstructor<TSchema>>;

/**
 * An intersection type that combines the `Model` class instance with the
 * inferred shape of the model object based on the schema definition.
 */
export type ModelCompositeValue<TSchema extends Schema | null> = TSchema extends Schema
	? InstanceType<ModelConstructor<TSchema>> & InferModelObject<TSchema>
	: InstanceType<ModelConstructor<TSchema>>;

export interface ModelFindAndCountResult<TSchema extends Schema | null> {
	/** Number of documents returned */
	count: number;
	/** Model instances for the returned documents */
	documents: ModelCompositeValue<TSchema>[];
}

export interface ModelIncrementResult<TSchema extends Schema | null> {
	originalDocument: ModelCompositeValue<TSchema>;
	updatedDocument: ModelCompositeValue<TSchema>;
}

export interface ModelDatabaseExecutionOptions {
	userDefined?: DbSubroutineUserDefinedOptions;
	requestId?: string;
	/** Maximum allowed return payload size in bytes */
	maxReturnPayloadSize?: number;
}
export type ModelDeleteByIdOptions = ModelDatabaseExecutionOptions;
export type ModelFindOptions<TSchema extends Schema | null> = QueryConstructorOptions<TSchema> &
	ModelDatabaseExecutionOptions;
export interface ModelFindByIdOptions extends ModelDatabaseExecutionOptions {
	/** Array of projection properties */
	projection?: string[];
}
export interface ModelIncrementOptions extends ModelDatabaseExecutionOptions {
	/**
	 * Number of retries to perform when record is locked
	 * @defaultValue 5
	 */
	retry?: number;
	/**
	 * Delay between retries in seconds when record is locked
	 * @defaultValue 1
	 */
	retryDelay?: number;
}

export type IncrementOperation<TSchema extends Schema | null> = TSchema extends Schema
	? {
			path: Extract<
				keyof FlattenDocument<TSchema, Schema | SchemaDefinition | SchemaTypeDefinitionNumber>,
				string
			>;
			value: number;
		}
	: never;
export type ModelReadFileContentsByIdOptions = ModelDatabaseExecutionOptions;
export type ModelSaveOptions = ModelDatabaseExecutionOptions;
// #endregion

/** Define a new model */
const compileModel = <TSchema extends Schema | null>(
	connection: Connection,
	schema: TSchema,
	file: string,
	dbServerDelimiters: DbServerDelimiters,
	logHandler: LogHandler,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
	logHandler.debug(`creating new model for file ${file}`);

	/** Model constructor */
	return class Model extends Document<TSchema> {
		/** Connection instance which constructed this model definition */
		public static readonly connection = connection;

		/** Database file this model acts against */
		public static readonly file = file;

		/** Schema that defines this model */
		public static readonly schema: TSchema = schema;

		/** Log handler instance used for diagnostic logging */
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

			const documentConstructorOptions: DocumentConstructorOptions<TSchema> = {
				data,
				record: mvRecord,
			};
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

			Model.#logHandler.debug(`creating new instance of model for file ${Model.file}`);

			this._transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.#logHandler.warn(
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		/** Delete a document */
		public static async deleteById(
			id: string,
			options: ModelDeleteByIdOptions = {},
		): Promise<ModelCompositeValue<TSchema> | null> {
			const { maxReturnPayloadSize, requestId, userDefined } = options;

			const data = await this.connection.executeDbSubroutine(
				'deleteById',
				{
					filename: this.file,
					id,
				},
				{
					...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
					...(requestId != null && { requestId }),
					...(userDefined && { userDefined }),
				},
			);

			if (data.result == null) {
				return null;
			}

			const { _id, __v, record } = data.result;

			return this.#createModelFromRecordString(record, _id, __v);
		}

		/** Find documents via query */
		public static async find(
			selectionCriteria: Filter<TSchema> = {} as Filter<TSchema>,
			options: ModelFindOptions<TSchema> = {},
		): Promise<ModelCompositeValue<TSchema>[]> {
			const { maxReturnPayloadSize, requestId, userDefined, ...queryConstructorOptions } = options;
			const query = new Query(
				this.connection,
				this.schema,
				this.file,
				this.#logHandler,
				selectionCriteria,
				queryConstructorOptions,
			);
			const { documents } = await query.exec({
				...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
				...(requestId != null && { requestId }),
				...(userDefined && { userDefined }),
			});

			return documents.map((document) => {
				const { _id, __v, record } = document;
				return this.#createModelFromRecordString(record, _id, __v);
			});
		}

		/** Find documents via query, returning them along with a count */
		public static async findAndCount(
			selectionCriteria: Filter<TSchema> = {} as Filter<TSchema>,
			options: ModelFindOptions<TSchema> = {},
		): Promise<ModelFindAndCountResult<TSchema>> {
			const { maxReturnPayloadSize, requestId, userDefined, ...queryConstructorOptions } = options;
			const query = new Query(
				this.connection,
				this.schema,
				this.file,
				this.#logHandler,
				selectionCriteria,
				queryConstructorOptions,
			);
			const { count, documents } = await query.exec({
				...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
				...(requestId != null && { requestId }),
				...(userDefined && { userDefined }),
			});

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
		): Promise<ModelCompositeValue<TSchema> | null> {
			const { maxReturnPayloadSize, requestId, projection, userDefined } = options;

			const data = await this.connection.executeDbSubroutine(
				'findById',
				{
					filename: this.file,
					id,
					projection: this.#formatProjection(projection),
				},
				{
					...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
					...(requestId != null && { requestId }),
					...(userDefined && { userDefined }),
				},
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
		): Promise<(ModelCompositeValue<TSchema> | null)[]> {
			const { maxReturnPayloadSize, requestId, projection, userDefined } = options;

			const idsArray = ensureArray(ids);
			const data = await this.connection.executeDbSubroutine(
				'findByIds',
				{
					filename: this.file,
					ids: idsArray,
					projection: this.#formatProjection(projection),
				},
				{
					...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
					...(requestId != null && { requestId }),
					...(userDefined && { userDefined }),
				},
			);

			return data.result.map((dbResultItem) => {
				if (dbResultItem == null) {
					return null;
				}

				const { _id, __v, record } = dbResultItem;
				return this.#createModelFromRecordString(record, _id, __v);
			});
		}

		/**
		 * Increment fields in a document by values
		 * @throws {Error} if schema is not defined
		 * @throws {Error} if no result is returned from increment operation
		 */
		public static async increment(
			id: string,
			operations: IncrementOperation<TSchema>[],
			options: ModelIncrementOptions = {},
		): Promise<ModelIncrementResult<TSchema>> {
			const { maxReturnPayloadSize, requestId, userDefined, retry = 5, retryDelay = 1 } = options;

			const transformedOperations = this.#formatIncrementOperations(operations);

			const data = await this.connection.executeDbSubroutine(
				'increment',
				{
					filename: this.file,
					id,
					operations: transformedOperations,
					retry,
					retryDelay,
				},
				{
					...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
					...(requestId != null && { requestId }),
					...(userDefined && { userDefined }),
				},
			);

			const {
				originalDocument: { __v: originalVersion, record: originalRecord },
				updatedDocument: { __v: updatedVersion, record: updatedRecord },
			} = data;

			return {
				originalDocument: this.#createModelFromRecordString(originalRecord, id, originalVersion),
				updatedDocument: this.#createModelFromRecordString(updatedRecord, id, updatedVersion),
			};
		}

		/** Read a DIR file type record directly from file system as Base64 string by its id */
		public static async readFileContentsById(
			id: string,
			options: ModelReadFileContentsByIdOptions = {},
		): Promise<string> {
			const { maxReturnPayloadSize, requestId, userDefined } = options;
			const data = await this.connection.executeDbSubroutine(
				'readFileContentsById',
				{
					filename: this.file,
					id,
				},
				{
					...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
					...(requestId != null && { requestId }),
					...(userDefined && { userDefined }),
				},
			);

			return data.result;
		}

		/** Create a new Model instance from a record string */
		static #createModelFromRecordString(
			recordString: string,
			_id: string,
			__v?: string | null,
		): ModelCompositeValue<TSchema> {
			return new Model({ _id, __v, record: recordString }) as ModelCompositeValue<TSchema>;
		}

		/** Format projection option */
		static #formatProjection(projection?: string[]): number[] | null {
			return projection != null && this.schema != null
				? this.schema.transformPathsToDbPositions(projection)
				: null;
		}

		/**
		 * Format increment operations to be sent to the database
		 */
		static #formatIncrementOperations(
			operations: IncrementOperation<TSchema>[],
		): DbSubroutineInputIncrementOperation[] {
			if (this.schema == null) {
				throw new Error('Schema must be defined to perform increment operations');
			}
			const incrementSchema = this.schema;

			return operations.map(({ path, value }) => ({
				path: incrementSchema.transformPathToOrdinalPosition(path),
				value,
			}));
		}

		/** Save a document to the database */
		public async save(options: ModelSaveOptions = {}): Promise<ModelCompositeValue<TSchema>> {
			const { maxReturnPayloadSize, requestId, userDefined } = options;
			if (this._id == null) {
				throw new TypeError('_id value must be set prior to saving');
			}

			// validate data prior to saving
			const validationErrors = this.validate();
			if (validationErrors.size > 0) {
				throw new DataValidationError({
					validationErrors,
					filename: Model.file,
					recordId: this._id,
				});
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
					{
						...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
						...(requestId != null && { requestId }),
						...(userDefined && { userDefined }),
					},
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
