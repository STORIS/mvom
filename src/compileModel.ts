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
export interface ModelConstructorOptionsBase {
	_id?: string | null;
	__v?: string | null;
}
export interface ModelConstructorOptionsData<TSchema extends GenericObject>
	extends ModelConstructorOptionsBase {
	data: TSchema;
}

export interface ModelConstructorOptionsRecord extends ModelConstructorOptionsBase {
	record: MvRecord;
}

export type ModelConstructorOptions<TSchema extends GenericObject> =
	| ModelConstructorOptionsData<TSchema>
	| ModelConstructorOptionsRecord;

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
	connection.logger.debug(`creating new model for file ${file}`);

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

		/** Private id tracking property */
		#__id: string | null;

		public constructor(options: ModelConstructorOptions<TSchema>) {
			const documentConstructorOptions: DocumentConstructorOptions =
				'record' in options ? { record: options.record } : { data: options.data };

			super(Model.schema, documentConstructorOptions);

			const { _id = null, __v = null } = options;

			this.#__id = _id;
			this.__v = __v;

			Object.defineProperty(this, '__id', {
				writable: true,
				configurable: false,
				enumerable: false,
			});

			Model.connection.logger.debug(`creating new instance of model for file ${Model.file}`);

			this.transformationErrors.forEach((error) => {
				// errors occurred while transforming data from multivalue format - log them
				Model.connection.logger.warn(
					`error transforming data -- file: ${Model.file}; _id: ${this._id}; class: ${error.transformClass}; value: ${error.transformValue}`,
				);
			});
		}

		/** _id getter */
		public get _id(): string | null {
			return this.#__id;
		}

		/** _id setter */
		public set _id(value) {
			if (this.#__id != null) {
				throw new Error('_id value cannot be changed once set');
			}

			this.#__id = value;
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

			return new Model({ _id, __v, record });
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
				return new Model({ _id, __v, record });
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
				return new Model({ _id, __v, record });
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

			return new Model({ _id, __v, record });
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
				return new Model({ _id, __v, record });
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

				return new Model({ _id, __v, record });
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
