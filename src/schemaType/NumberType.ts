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
	protected readonly dataTransformer: NumberDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionNumber,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbDecimals } = definition;

		this.dataTransformer = new NumberDataTransformer(dbDecimals);
	}

	/** NumberType data type validator */
	protected override validateType = (value: unknown): boolean =>
		value == null || Number.isFinite(Number(value));
}

export default NumberType;
