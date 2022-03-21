import { assignIn, cloneDeep, get as getIn, set as setIn } from 'lodash';
import { TransformDataError } from './errors';
import ForeignKeyDbTransformer from './ForeignKeyDbTransformer';
import type Schema from './Schema';
import type { GenericObject, MvRecord } from './types';

// #region Types
export interface DocumentConstructorOptions {
	data?: GenericObject;
	record?: MvRecord;
	isSubdocument?: boolean;
}

export interface BuildForeignKeyDefinitionsResult {
	filename: string;
	entityName: string;
	entityIds: string[];
}
// #endregion

/** A document object */
class Document {
	[key: string]: unknown;

	public _raw?: MvRecord;

	/** Array of any errors which occurred during transformation from the database */
	public transformationErrors: TransformDataError[];

	/** Schema instance which defined this document */
	readonly #schema: Schema | null;

	/** Record array of multivalue data */
	#record: MvRecord;

	/** Indicates whether this document is a subdocument of a composing parent */
	readonly #isSubdocument: boolean;

	public constructor(schema: Schema | null, options: DocumentConstructorOptions) {
		const { data = {}, record, isSubdocument = false } = options;

		this.#schema = schema;
		this.#record = [];
		this.#isSubdocument = isSubdocument;
		this.transformationErrors = [];

		Object.defineProperties(this, {
			transformationErrors: { configurable: false, enumerable: false, writable: false },
		});

		if (record != null) {
			this.#transformRecordToDocument(record);
		}
		// load the data passed to constructor into document instance
		assignIn(this, data);
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

	/** Build a list of foreign key definitions to be used by the database for foreign key validation */
	public buildForeignKeyDefinitions(): BuildForeignKeyDefinitionsResult[] {
		if (this.#schema === null) {
			return [];
		}

		// U2 does not allow commas in filenames so we can use it to separate filename/entityName combinations
		const separator = ',';
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
				const filename = keyParts[0];
				// Just incase the entity name included a comma, rejoin
				const entityName = keyParts.slice(1).join(separator);
				acc.push({ filename, entityName, entityIds: Array.from(value) });
				return acc;
			},
			[],
		);
	}

	/** Validate document for errors */
	public async validate(): Promise<Map<string, string | string[]>> {
		const documentErrors = new Map<string, string | string[]>();

		if (this.#schema !== null) {
			if (
				typeof this._id === 'string' &&
				this.#schema.idMatch != null &&
				!this.#schema.idMatch.test(this._id)
			) {
				documentErrors.set('_id', 'Document id does not match pattern');
			}
			await Promise.all(
				Array.from(this.#schema.paths).map(async ([keyPath, schemaType]) => {
					let value: unknown = getIn(this, keyPath, null);
					// cast to complex data type if necessary
					try {
						value = schemaType.cast(value);
						setIn(this, keyPath, value);

						const errors = await schemaType.validate(value, this);
						if (errors.length > 0) {
							documentErrors.set(keyPath, errors);
						}
					} catch (err) {
						// an error was thrown - return the message from that error in the documentErrors list
						documentErrors.set(keyPath, err.message);
					}
				}),
			);
		}
		return documentErrors;
	}

	/** Apply schema structure using record to document instance */
	#transformRecordToDocument(record: MvRecord) {
		// hold on to the original to use as the baseline when saving
		this.#record = record;

		const plainDocument =
			this.#schema === null
				? { _raw: this.#record }
				: Array.from(this.#schema.paths).reduce((document, [keyPath, schemaType]) => {
						let setValue;
						try {
							setValue = schemaType.get(this.#record);
						} catch (err) {
							if (err instanceof TransformDataError) {
								// if this was an error in data transformation, set the value to null and add to transformationErrors list
								setValue = null;
								this.transformationErrors.push(err);
							} else {
								// otherwise rethrow any other type of error
								throw err;
							}
						}
						setIn(document, keyPath, setValue);
						return document;
				  }, {});

		assignIn(this, plainDocument);
	}
}

export default Document;
