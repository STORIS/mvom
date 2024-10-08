import { StringDataTransformer } from '../dataTransformers';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import ForeignKeyDbTransformer from '../ForeignKeyDbTransformer';
import type { SchemaCompoundForeignKeyDefinition, SchemaForeignKeyDefinition } from '../Schema';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase, Validator } from './BaseSchemaType';

export interface SchemaTypeDefinitionString extends SchemaTypeDefinitionBase {
	type: 'string';
	enum?: readonly string[];
	match?: RegExp;
	foreignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
}

/** String Schema Type */
class StringType extends BaseScalarType {
	/** Data transformer */
	protected readonly dataTransformer: StringDataTransformer;

	/** Array of allowed enumerations */
	private readonly enum: readonly string[] | null;

	/* Regular expression to validate the property value against */
	private readonly match: RegExp | null;

	/* Transform schema foreign key definitions to the db format */
	private readonly foreignKeyDbTransformer: ForeignKeyDbTransformer;

	public constructor(
		definition: SchemaTypeDefinitionString,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { enum: definitionEnum, match, foreignKey } = definition;

		this.enum = definitionEnum ?? null;
		this.match = match ?? null;
		this.foreignKeyDbTransformer = new ForeignKeyDbTransformer(foreignKey);

		this.dataTransformer = new StringDataTransformer(definitionEnum);

		// add validators for this type
		this.validators.unshift(this.createMatchValidator());
		this.validators.unshift(this.createEnumValidator());
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return this.foreignKeyDbTransformer.transform(value);
	}

	/** String required validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- Use any instead of unknown to avoid type errors in enum validation
	protected override validateRequired = (value: any): boolean =>
		!this.required || this.enum?.includes(value) || (value != null && value !== '');

	/** Enum validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any instead of unknown to avoid type errors in enum validation
	private validateEnum = (value: any): boolean =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		value == null || this.enum == null || this.enum.includes(value);

	/** Create validation object for enum validation */
	private createEnumValidator(): Validator {
		const message = 'Value not present in list of allowed values';

		return { validationFn: this.validateEnum, message };
	}

	/** Match validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private validateMatch = (value: any): boolean =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		value == null || this.match == null || this.match.test(value);

	/** Create validation object for match validation */
	private createMatchValidator(): Validator {
		const message = 'Value does not match pattern';

		return { validationFn: this.validateMatch, message };
	}
}

export default StringType;
