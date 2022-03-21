import { StringDataTransformer } from '../dataTransformers';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import ForeignKeyDbTransformer from '../ForeignKeyDbTransformer';
import type { SchemaCompoundForeignKeyDefinition, SchemaForeignKeyDefinition } from '../Schema';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase, Validator } from './BaseSchemaType';

export interface SchemaTypeDefinitionString extends SchemaTypeDefinitionBase {
	type: 'string';
	enum?: string[];
	match?: RegExp;
	foreignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
}

/** String Schema Type */
class StringType extends BaseScalarType {
	/** Array of allowed enumerations */
	private readonly enum: string[] | null;

	/* Regular expression to validate the property value against */
	private readonly match: RegExp | null;

	/* Transform schema foreign key definitions to the db format */
	private readonly foreignKeyDbTransformer: ForeignKeyDbTransformer;

	/** Data transformer */
	private readonly dataTransformer: StringDataTransformer;

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

	/** Transform mv string to js string */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform js string to mv string */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to the format schema */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return this.foreignKeyDbTransformer.transform(value);
	}

	/** String required validator */
	protected override validateRequired = (value: unknown): boolean =>
		!this.required || (value != null && value !== '');

	/** Enum validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
