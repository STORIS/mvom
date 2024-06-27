import { cloneDeep, isPlainObject, set as setIn } from 'lodash';
import Document from '../Document';
import type Schema from '../Schema';
import type { SchemaDefinition } from '../Schema';
import type { MvRecord } from '../types';
import BaseSchemaType from './BaseSchemaType';

/** Embedded Schema Type */
class EmbeddedType<
	TSchema extends Schema<TSchemaDefinition>,
	TSchemaDefinition extends SchemaDefinition,
> extends BaseSchemaType {
	/** An instance of Schema representing the the document structure of embedded object contents */
	private readonly valueSchema: TSchema;

	public constructor(valueSchema: TSchema) {
		super();

		this.valueSchema = valueSchema;
	}

	/**
	 * Cast to embedded data type
	 * @throws {@link TypeError} Throws if a non-null/non-object is passed
	 */
	public override cast(value: unknown): Document<TSchema, TSchemaDefinition> {
		// convert value to a plain structure and then recast as embedded document
		const plainValue = value == null ? {} : JSON.parse(JSON.stringify(value));
		if (!isPlainObject(plainValue)) {
			throw new TypeError('Cast value must be an object');
		}
		return Document.createSubdocumentFromData(this.valueSchema, plainValue);
	}

	/** Get value from mv data */
	public get(record: MvRecord): Document<TSchema, TSchemaDefinition> {
		const embeddedDocument = Document.createSubdocumentFromRecord<TSchema, TSchemaDefinition>(
			this.valueSchema,
			record,
		);
		return embeddedDocument;
	}

	/** Set specified embedded document value into mv record */
	public set(originalRecord: MvRecord, setValue: Document<TSchema, TSchemaDefinition>): MvRecord {
		const record = cloneDeep(originalRecord);
		const subrecord = setValue.transformDocumentToRecord();
		subrecord.forEach((value, arrayPos) => {
			if (typeof value !== 'undefined') {
				setIn(record, [arrayPos], value);
			}
		});
		return record;
	}

	/** Validate the embedded document */
	public validate(document: Document<TSchema, TSchemaDefinition>): Map<string, string[]> {
		// - validation against the embedded document will return a single object with 0 to n keys - only those with keys indicate errors;
		return document.validate();
	}
}

export default EmbeddedType;
