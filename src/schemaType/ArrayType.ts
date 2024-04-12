import type Document from '../Document';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type { MvRecord } from '../types';
import { ensureArray } from '../utils';
import BaseScalarArrayType from './BaseScalarArrayType';
import type BaseScalarType from './BaseScalarType';

/** Scalar Array Schema Type */
class ArrayType extends BaseScalarArrayType {
	public constructor(valueSchemaType: BaseScalarType) {
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
	public async validate(value: unknown, document: Document, keyPath: string): Promise<string[]> {
		console.log(`validating array type. ${keyPath} `);
		return (
			await Promise.all(
				ensureArray(value).map((arrayItem) =>
					this.valueSchemaType.validate(arrayItem, document, keyPath),
				),
			)
		).flat();
	}
}

export default ArrayType;
