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
	public validate(value: unknown): Map<string, string[]> {
		return ensureArray(value).reduce<Map<string, string[]>>((acc, arrayItem, index) => {
			ensureArray(arrayItem).forEach((nestedArrayItem, nestedIndex) => {
				const result = this.valueSchemaType.validate(nestedArrayItem);

				if (result.length > 0) {
					const key = `${index}.${nestedIndex}`;
					acc.set(key, result);
				}
			});

			return acc;
		}, new Map());
	}
}

export default NestedArrayType;
