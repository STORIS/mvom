import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type { MvRecord } from '../types';
import { ensureArray } from '../utils';
import BaseScalarArrayType from './BaseScalarArrayType';
import type BaseScalarType from './BaseScalarType';

/** Scalar Array Schema Type */
class ArrayType<TSchemaType extends BaseScalarType> extends BaseScalarArrayType<TSchemaType> {
	public constructor(valueSchemaType: TSchemaType) {
		super(valueSchemaType);
	}

	/** Get value from mv data */
	public get(record: MvRecord): unknown[] {
		const value = this.valueSchemaType.getFromMvData(record);

		return ensureArray(value).map((itemValue) => this.valueSchemaType.transformFromDb(itemValue));
	}

	/** Set specified array value into mv record */
	public set(originalRecord: MvRecord, setValue: unknown): MvRecord {
		return this.valueSchemaType.setIntoMvData(
			originalRecord,
			ensureArray(setValue).map((value) => this.valueSchemaType.transformToDb(value)),
		);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return ensureArray(value)
			.map((itemValue) => this.valueSchemaType.transformForeignKeyDefinitionsToDb(itemValue))
			.flat();
	}

	/** Validate the array */
	public async validate(value: unknown): Promise<Map<string, string[]>> {
		const errorsMap = new Map<string, string[]>();
		await Promise.all(
			ensureArray(value).map(async (arrayItem, index) => {
				const result = await this.valueSchemaType.validate(arrayItem);

				if (result.length > 0) {
					const key = String(index);
					errorsMap.set(key, result);
				}
			}),
		);

		return errorsMap;
	}
}

export default ArrayType;
