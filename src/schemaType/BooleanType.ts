import { BooleanDataTransformer } from '../dataTransformers';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionBoolean extends SchemaTypeDefinitionBase {
	type: 'boolean';
}

/** Boolean Schema Type */
class BooleanType extends BaseScalarType {
	/** Data transformer */
	private readonly dataTransformer: BooleanDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionBoolean,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		this.dataTransformer = new BooleanDataTransformer();
	}

	/** Transform mv style data to Boolean */
	public transformFromDb(value: unknown): boolean {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform js style data to mv style data */
	public transformToDb(value: unknown): '1' | '0' {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to u2 formatted Boolean */
	public override transformToQuery(value: true | 'true' | 'TRUE'): '1';
	public override transformToQuery(value: false | 'false' | 'FALSE'): '0';
	public override transformToQuery(value: unknown): unknown;
	public override transformToQuery(value: unknown): unknown {
		return this.dataTransformer.transformToQuery(value);
	}
}

export default BooleanType;
