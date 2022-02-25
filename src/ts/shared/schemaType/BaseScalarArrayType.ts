import { ensureArray } from '#shared/utils';
import BaseType from './BaseType';
import type ScalarType from './ScalarType';

/** Abstract Base Type for all scalar arrays */
abstract class BaseScalarArrayType extends BaseType {
	/** A schemaType representing the type of the array's contents */
	private valueSchemaType: ScalarType;

	protected constructor(valueSchemaType: ScalarType) {
		super();
		this.valueSchemaType = valueSchemaType;
	}

	/** Cast to array type */
	public override cast(value: unknown): unknown[] {
		return ensureArray(value);
	}

	/** Transform query constants to the format defined by the array's schema */
	public transformToQuery(value: unknown): unknown {
		return this.valueSchemaType.transformToQuery(value);
	}
}

export default BaseScalarArrayType;
