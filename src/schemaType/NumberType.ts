import { NumberDataTransformer } from '../dataTransformers';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionNumber extends SchemaTypeDefinitionBase {
	type: 'number';
	dbDecimals?: number;
}

/** Number Schema Type */
class NumberType extends BaseScalarType {
	/** Data transformer */
	private readonly dataTransformer: NumberDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionNumber,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbDecimals } = definition;

		this.dataTransformer = new NumberDataTransformer(dbDecimals);
	}

	/** Transform mv style internally formatted numeric data (nnnnn) to externally formatted numeric data (nnn.nn) */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): number;
	public transformFromDb(value: unknown): number | null {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform externally formatted numeric data (nnn.nn) to mv style internally formatted numeric data */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to u2 formatted string number */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
	}

	/** NumberType data type validator */
	protected override validateType = (value: unknown): boolean =>
		value == null || Number.isFinite(Number(value));
}

export default NumberType;
