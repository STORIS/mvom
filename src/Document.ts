import { assignIn, cloneDeep, get as getIn, set as setIn } from 'lodash';
import { TransformDataError } from './errors';
import ForeignKeyDbTransformer from './ForeignKeyDbTransformer';
import type Schema from './Schema';
import type { InferDocumentObject } from './Schema';
import type { DbServerDelimiters, DeepOptionalNullable, MvRecord } from './types';

// #region Types
/** Type of data property for constructing a document dependent upon the schema */
export type DocumentData<TSchema extends Schema | null> = DeepOptionalNullable<
	InferDocumentObject<TSchema>
>;

export interface DocumentConstructorOptions<TSchema extends Schema | null> {
	data?: DocumentData<TSchema>;
	record?: MvRecord;
	isSubdocument?: boolean;
}

export interface BuildForeignKeyDefinitionsResult {
	filename: string[];
	entityName: string;
	entityIds: string[];
}

/**
 * An intersection type that combines the `Document` class instance with the
 * inferred shape of the document object based on the schema definition.
 */
export type DocumentCompositeValue<TSchema extends Schema | null> = Document<TSchema> &
	InferDocumentObject<TSchema>;
// #endregion

/** A document object */
class Document<TSchema extends Schema | null> {
	[key: string]: unknown;

	public _raw!: TSchema extends Schema ? never : MvRecord;

	/** Array of any errors which occurred during transformation from the database */
	public _transformationErrors: TransformDataError[];

	/** Schema instance which defined this document */
	readonly #schema: TSchema;

	/** Record array of multivalue data */
	#record: MvRecord;

	/** Indicates whether this document is a subdocument of a composing parent */
	readonly #isSubdocument: boolean;

	protected constructor(schema: TSchema, options: DocumentConstructorOptions<TSchema>) {
		const { data = {}, record, isSubdocument = false } = options;

		this.#schema = schema;
		this.#record = record ?? [];
		this.#isSubdocument = isSubdocument;
		this._transformationErrors = [];

		Object.defineProperties(this, {
			_transformationErrors: { configurable: false, enumerable: false, writable: false },
		});

		if (schema == null) {
			this._raw = this.#record as TSchema extends Schema ? never : MvRecord;
		}

		this.#transformRecordToDocument();

		// load the data passed to constructor into document instance
		assignIn(this, data);
	}

	/** Create a new Subdocument instance from a record array */
	public static createSubdocumentFromRecord<TSchema extends Schema | null>(
		schema: TSchema,
		record: MvRecord,
	): DocumentCompositeValue<TSchema> {
		return new Document(schema, { record, isSubdocument: true }) as DocumentCompositeValue<TSchema>;
	}

	/** Create a new Subdocument instance from data */
	public static createSubdocumentFromData<TSchema extends Schema>(
		schema: TSchema,
		data: DocumentData<TSchema>,
	): DocumentCompositeValue<TSchema> {
		return new Document(schema, { data, isSubdocument: true }) as DocumentCompositeValue<TSchema>;
	}

	/** Create a new Document instance from a record string */
	public static createDocumentFromRecordString<TSchema extends Schema | null>(
		schema: TSchema,
		recordString: string,
		dbServerDelimiters: DbServerDelimiters,
	): DocumentCompositeValue<TSchema> {
		const record = Document.convertMvStringToArray(recordString, dbServerDelimiters);

		return new Document(schema, { record }) as DocumentCompositeValue<TSchema>;
	}

	/** Convert a multivalue string to an array */
	public static convertMvStringToArray(
		recordString: string,
		dbServerDelimiters: DbServerDelimiters,
	): MvRecord {
		const { am, vm, svm } = dbServerDelimiters;
		const record: MvRecord =
			recordString === ''
				? []
				: recordString.split(am).map((attribute) => {
						if (attribute === '') {
							return null;
						}

						const attributeArray = attribute.split(vm);
						if (attributeArray.length === 1 && !attributeArray[0].includes(svm)) {
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

		return record;
	}

	/** Transform document structure to multivalue array structure */
	public transformDocumentToRecord(): MvRecord {
		return this.#schema === null
			? getIn(this, '_raw', [])
			: Array.from(this.#schema.paths).reduce(
					(record, [keyPath, schemaType]) => {
						const value = getIn(this, keyPath, null);
						return schemaType.set(record, schemaType.cast(value));
					},
					this.#isSubdocument ? [] : cloneDeep(this.#record),
				);
	}

	/**
	 * Build a list of foreign key definitions to be used by the database for foreign key validation
	 * TODO: Foreign keys are a Model concept and not a Document concept. Relocate this logic.
	 */
	public buildForeignKeyDefinitions(): BuildForeignKeyDefinitionsResult[] {
		if (this.#schema === null) {
			return [];
		}

		// U2 does not allow pound signs in filenames so we can use it to separate filename/entityName combinations
		const separator = '#';
		const definitionMap = Array.from(this.#schema.paths).reduce(
			(foreignKeyDefinitions, [keyPath, schemaType]) => {
				const value = getIn(this, keyPath, null);
				const definitions = schemaType.transformForeignKeyDefinitionsToDb(schemaType.cast(value));
				// Deduplicate foreign key definitions by using a filename / entity name combination
				// We could deduplicate using just the filename but ignoring the entity name could result in confusing error messages
				definitions.forEach(({ filename, entityId, entityName }) => {
					const key = `${filename}${separator}${entityName}`;
					const accumulatedEntityIds = foreignKeyDefinitions.get(key) ?? new Set<string>();
					// For array types we may need to validate multiple foreign keys
					accumulatedEntityIds.add(entityId);
					foreignKeyDefinitions.set(key, accumulatedEntityIds);
				});

				return foreignKeyDefinitions;
			},
			new Map<string, Set<string>>(),
		);

		if (this.#schema.idForeignKey != null) {
			const foreignKeyDbTransformer = new ForeignKeyDbTransformer(this.#schema.idForeignKey);
			const definitions = foreignKeyDbTransformer.transform(this._id);
			definitions.forEach(({ filename, entityId, entityName }) => {
				const key = `${filename}${separator}${entityName}`;
				const accumulatedEntityIds = definitionMap.get(key) ?? new Set<string>();
				accumulatedEntityIds.add(entityId);
				definitionMap.set(key, accumulatedEntityIds);
			});
		}

		return Array.from(definitionMap).reduce<BuildForeignKeyDefinitionsResult[]>(
			(acc, [key, value]) => {
				const keyParts = key.split(separator);
				const fileName = keyParts[0];
				// If an array of filenames was provided, when we transformed the array into a string above, commas
				// would have been inserted between each filename. Split the string back into an array.
				const filename = fileName.split(',');
				// Just incase the entity name included a pound sign, rejoin
				const entityName = keyParts.slice(1).join(separator);
				acc.push({ filename, entityName, entityIds: Array.from(value) });
				return acc;
			},
			[],
		);
	}

	/** Validate document for errors */
	public validate(): Map<string, string[]> {
		const documentErrors = new Map<string, string[]>();

		if (this.#schema !== null) {
			Array.from(this.#schema.paths).forEach(([keyPath, schemaType]) => {
				const originalValue: unknown = getIn(this, keyPath, null);
				// cast to complex data type if necessary
				try {
					const castValue = schemaType.cast(originalValue);
					setIn(this, keyPath, castValue);

					const validationResult = schemaType.validate(castValue);
					if (validationResult instanceof Map) {
						validationResult.forEach((errors, key) => {
							if (errors.length > 0) {
								documentErrors.set(`${keyPath}.${key}`, errors);
							}
						});
					} else if (validationResult.length > 0) {
						documentErrors.set(keyPath, validationResult);
					}
				} catch (err) {
					// an error was thrown - return the message from that error in an array in the documentErrors list
					documentErrors.set(keyPath, [err.message]);
				}
			});
		}
		return documentErrors;
	}

	/** Apply schema structure using record to document instance */
	#transformRecordToDocument() {
		if (this.#schema == null) {
			// if this is a document without a schema, there is nothing to transform
			return;
		}

		const plainDocument = Array.from(this.#schema.paths).reduce(
			(document, [keyPath, schemaType]) => {
				let setValue;
				try {
					setValue = schemaType.get(this.#record);
				} catch (err) {
					if (err instanceof TransformDataError) {
						// if this was an error in data transformation, set the value to null and add to transformationErrors list
						setValue = null;
						this._transformationErrors.push(err);
					} else {
						// otherwise rethrow any other type of error
						throw err;
					}
				}
				setIn(document, keyPath, setValue);
				return document;
			},
			{},
		);

		assignIn(this, plainDocument);
	}
}

export default Document;
