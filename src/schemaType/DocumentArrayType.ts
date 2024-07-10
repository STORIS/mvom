import { cloneDeep, get as getIn, isPlainObject, set as setIn } from 'lodash';
import Document from '../Document';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type Schema from '../Schema';
import type { SchemaDefinition } from '../Schema';
import type { MvRecord } from '../types';
import { ensureArray } from '../utils';
import BaseSchemaType from './BaseSchemaType';

/** A Document Array Schema Type */
class DocumentArrayType<TSchema extends Schema<SchemaDefinition>> extends BaseSchemaType {
	/** An instance of Schema representing the document structure of the array's contents */
	private readonly valueSchema: TSchema;

	public constructor(valueSchema: TSchema) {
		super();
		this.valueSchema = valueSchema;
	}

	/**
	 * Cast to array of documents
	 * @throws {@link TypeError} Throws if a non-null/non-object is passed
	 */
	public override cast(value: unknown): Document<TSchema>[] {
		if (value == null) {
			return [];
		}

		return ensureArray(value).map((subdocument) => {
			// convert subdocument to a plain structure and then recast as document
			const plainValue = subdocument == null ? {} : JSON.parse(JSON.stringify(subdocument));
			if (!isPlainObject(plainValue)) {
				throw new TypeError('Cast value must be an object');
			}
			return Document.createSubdocumentFromData(this.valueSchema, plainValue);
		});
	}

	/** Get value from mv data */
	public get(record: MvRecord): Document<TSchema>[] {
		return [...this.makeSubDocument(record)];
	}

	/** Set specified document array value into mv record */
	public set(originalRecord: MvRecord, documents: Document<TSchema>[]): MvRecord {
		const record = cloneDeep(originalRecord);
		const mvPaths = this.valueSchema.getMvPaths();
		// A subdocumentArray is always overwritten entirely so clear out all associated fields
		mvPaths.forEach((path) => {
			setIn(record, path, null);
		});
		documents.forEach((subdocument, iteration) => {
			const subrecord = subdocument.transformDocumentToRecord();

			mvPaths.forEach((path) => {
				const value = getIn(subrecord, path, null);
				setIn(record, path.concat(iteration), value);
			});
		});
		return record;
	}

	/** Validate the document array */
	public validate(documentList: Document<TSchema>[]): Map<string, string[]> {
		return documentList.reduce<Map<string, string[]>>((acc, document, index) => {
			const documentErrors = document.validate();

			documentErrors.forEach((messages, keyPath) => {
				if (messages.length > 0) {
					const errorsMapKey = `${index}.${keyPath}`;
					acc.set(errorsMapKey, messages);
				}
			});

			return acc;
		}, new Map());
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(
		documentList: Document<TSchema>[],
	): ForeignKeyDbDefinition[] {
		return documentList
			.map((document) => {
				const documentForeignKeyDefinitions = document.buildForeignKeyDefinitions();

				return documentForeignKeyDefinitions.map(({ filename, entityName, entityIds }) =>
					entityIds.map((entityId) => ({ filename, entityName, entityId })),
				);
			})
			.flat(2);
	}

	/** Generate subdocument instances */
	private *makeSubDocument(record: MvRecord): Generator<Document<TSchema>> {
		const makeSubRecord = (iteration: number): MvRecord =>
			this.valueSchema.getMvPaths().reduce<MvRecord>((acc, path) => {
				const value = this.getFromMvArray(path.concat([iteration]), record);
				if (typeof value !== 'undefined') {
					setIn(acc, path, value);
				}
				return acc;
			}, []);

		let iteration = 0;
		while (true) {
			const subRecord = makeSubRecord(iteration);
			if (subRecord.length === 0) {
				return;
			}
			const subdocument = Document.createSubdocumentFromRecord<TSchema>(
				this.valueSchema,
				subRecord,
			);

			yield subdocument;
			iteration += 1;
		}
	}
}

export default DocumentArrayType;
