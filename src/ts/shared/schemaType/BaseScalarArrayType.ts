import { ensureArray } from '#shared/utils';
import type BaseScalarType from './BaseScalarType';
import BaseSchemaType from './BaseSchemaType';

/** Abstract Base Type for all scalar arrays */
abstract class BaseScalarArrayType extends BaseSchemaType {
	/** A schemaType representing the type of the array's contents */
	protected valueSchemaType: BaseScalarType;

	protected constructor(valueSchemaType: BaseScalarType) {
		super();
		this.valueSchemaType = valueSchemaType;
	}

	/** Cast to array type */
	public override cast(value: unknown): unknown[] {
		return value != null ? ensureArray(value) : [];
	}

	/** Transform query constants to the format defined by the array's schema */
	public transformToQuery(value: unknown): unknown {
		return this.valueSchemaType.transformToQuery(value);
	}
}

export default BaseScalarArrayType;
