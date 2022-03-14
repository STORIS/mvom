import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionBoolean extends SchemaTypeDefinitionBase {
	type: 'boolean';
}

/** Boolean Schema Type */
class BooleanType extends BaseScalarType {
	public constructor(
		definition: SchemaTypeDefinitionBoolean,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);
	}

	/** Transform mv style data to Boolean */
	public transformFromDb(value: unknown): boolean {
		// this logic is intentionally trying to mimic the Boolean rules of the UniBasic interpreter
		return value != null && value !== '0' && value !== 0;
	}

	/** Transform js style data to mv style data */
	public transformToDb(value: unknown): '1' | '0' {
		return value ? '1' : '0';
	}

	/** Transform query constants to u2 formatted Boolean */
	public override transformToQuery(value: true | 'true' | 'TRUE'): '1';
	public override transformToQuery(value: false | 'false' | 'FALSE'): '0';
	public override transformToQuery(value: unknown): unknown;
	public override transformToQuery(value: unknown): unknown {
		if (value === true || value === 'true' || value === 'TRUE') {
			return '1';
		}

		if (value === false || value === 'false' || value === 'FALSE') {
			return '0';
		}

		return value;
	}
}

export default BooleanType;
