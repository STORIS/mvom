import { ensureArray } from '../utils';
import type BaseScalarType from './BaseScalarType';
import BaseSchemaType from './BaseSchemaType';

/** Abstract Base Type for all scalar arrays */
abstract class BaseScalarArrayType<TSchemaType extends BaseScalarType> extends BaseSchemaType {
	/** A schemaType representing the type of the array's contents */
	protected readonly valueSchemaType: TSchemaType;

	protected constructor(valueSchemaType: TSchemaType) {
		super();
		this.valueSchemaType = valueSchemaType;
	}

	/** Cast to array type */
	public override cast(value: unknown): unknown[] {
		return value != null ? ensureArray(value) : [];
	}
}

export default BaseScalarArrayType;
