import { cloneDeep, isPlainObject, set as setIn } from 'lodash';
import Document from '../Document';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type Schema from '../Schema';
import type { MvRecord } from '../types';
import { ensureArray, getFromMvArray } from '../utils';
import BaseSchemaType from './BaseSchemaType';

/** A Document Array Schema Type */
class DocumentArrayType extends BaseSchemaType {
	/** An instance of Schema representing the document structure of the array's contents */
	private valueSchema: Schema;

	public constructor(valueSchema: Schema) {
		super();
		this.valueSchema = valueSchema;
	}

	/**
	 * Cast to array of documents
	 * @throws {@link TypeError} Throws if a non-null/non-object is passed
	 */
	public override cast(value: unknown): Document[] {
		if (value == null) {
			return [];
		}

		return ensureArray(value).map((subdocument) => {
			// convert subdocument to a plain structure and then recast as document
			const plainValue = subdocument == null ? {} : JSON.parse(JSON.stringify(subdocument));
			if (!isPlainObject(plainValue)) {
				throw new TypeError('Cast value must be an object');
			}
			return new Document(this.valueSchema, { data: plainValue, isSubdocument: true });
		});
	}

	/** Get value from mv data */
	public get(record: MvRecord): Document[] {
		return [...this.makeSubDocument(record)];
	}

	/** Set specified document array value into mv record */
	public set(originalRecord: MvRecord, setValue: Document[]): MvRecord {
		const record = cloneDeep(originalRecord);
		// A subdocumentArray is always overwritten entirely so clear out all associated fields
		this.valueSchema.getMvPaths().forEach((path) => {
			setIn(record, path, null);
		});
		setValue.forEach((subdocument, iteration) => {
			const subrecord = subdocument.transformDocumentToRecord();
			subrecord.forEach((value, arrayPos) => {
				if (typeof value !== 'undefined') {
					setIn(record, [arrayPos, iteration], value);
				}
			});
		});
		return record;
	}

	/** Validate the document array */
	public async validate(documentList: Document[]): Promise<string[]> {
		// combining all the validation into one array of promise.all
		// - validation against the documents in the array will return a single object with 0 to n keys - only those with keys indicate errors;
		// - iterate the returned object and return the messages from each
		// - flatten the final results

		return (
			await Promise.all(
				documentList.map(async (document) => {
					const documentErrors = await document.validate();

					return Object.values(documentErrors).map((err) => ensureArray(err));
				}),
			)
		).flat(2);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(
		documentList: Document[],
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
	private *makeSubDocument(record: MvRecord): Generator<Document> {
		const makeSubRecord = (iteration: number): MvRecord =>
			this.valueSchema.getMvPaths().reduce<MvRecord>((acc, path) => {
				const value = getFromMvArray(path.concat([iteration]), record);
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
			const subdocument = new Document(this.valueSchema, {
				isSubdocument: true,
				record: subRecord,
			});
			yield subdocument;
			iteration += 1;
		}
	}
}

export default DocumentArrayType;
