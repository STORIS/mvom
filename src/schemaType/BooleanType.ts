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
	protected readonly dataTransformer: BooleanDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionBoolean,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		this.dataTransformer = new BooleanDataTransformer();
	}
}

export default BooleanType;
