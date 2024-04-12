import type Document from '../Document';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type { MvRecord } from '../types';
import { ensureArray } from '../utils';
import BaseScalarArrayType from './BaseScalarArrayType';
import type BaseScalarType from './BaseScalarType';

/** Nested Scalar Array Schema Type */
class NestedArrayType extends BaseScalarArrayType {
	public constructor(valueSchemaType: BaseScalarType) {
		super(valueSchemaType);
	}

	/** Get value from mv data */
	public get(record: MvRecord): unknown[][] {
		const value = this.valueSchemaType.getFromMvData(record);

		return ensureArray(value).map((itemValue) =>
			ensureArray(itemValue).map((nestedValue) =>
				this.valueSchemaType.transformFromDb(nestedValue),
			),
		);
	}

	/** Set specified nested array value into mv record */
	public set(originalRecord: MvRecord, setValue: unknown): MvRecord {
		return this.valueSchemaType.setIntoMvData(
			originalRecord,
			ensureArray(setValue).map((value) =>
				ensureArray(value).map((nestedValue) => this.valueSchemaType.transformToDb(nestedValue)),
			),
		);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return ensureArray(value)
			.flat(Infinity)
			.map((nestedValue) => this.valueSchemaType.transformForeignKeyDefinitionsToDb(nestedValue))
			.flat();
	}

	/** Validate the nested array */
	public async validate(value: unknown, document: Document): Promise<string[]> {
		return (
			await Promise.all(
				ensureArray(value)
					.flat(Infinity)
					.map((arrayItem) => this.valueSchemaType.validate(arrayItem, document)),
			)
		).flat();
	}
}

export default NestedArrayType;
