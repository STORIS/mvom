import { cloneDeep, isPlainObject, set as setIn } from 'lodash';
import Document from '../Document';
import type Schema from '../Schema';
import type { MvRecord } from '../types';
import BaseSchemaType from './BaseSchemaType';

/** Embedded Schema Type */
class EmbeddedType extends BaseSchemaType {
	/** An instance of Schema representing the the document structure of embedded object contents */
	private readonly valueSchema: Schema;

	public constructor(valueSchema: Schema) {
		super();

		this.valueSchema = valueSchema;
	}

	/**
	 * Cast to embedded data type
	 * @throws {@link TypeError} Throws if a non-null/non-object is passed
	 */
	public override cast(value: unknown): Document {
		// convert value to a plain structure and then recast as embedded document
		const plainValue = value == null ? {} : JSON.parse(JSON.stringify(value));
		if (!isPlainObject(plainValue)) {
			throw new TypeError('Cast value must be an object');
		}
		return Document.createSubdocumentFromData(this.valueSchema, plainValue);
	}

	/** Get value from mv data */
	public get(record: MvRecord): Document {
		const embeddedDocument = Document.createSubdocumentFromRecord(this.valueSchema, record);
		return embeddedDocument;
	}

	/** Set specified embedded document value into mv record */
	public set(originalRecord: MvRecord, setValue: Document): MvRecord {
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
	public validate(document: Document): Promise<Map<string, string[]>> {
		// - validation against the embedded document will return a single object with 0 to n keys - only those with keys indicate errors;
		return document.validate();
	}
}

export default EmbeddedType;
