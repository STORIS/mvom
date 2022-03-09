import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import ForeignKeyDbTransformer from '../ForeignKeyDbTransformer';
import type {
	SchemaCompoundForeignKeyDefinition,
	SchemaForeignKeyDefinition,
	ValidationFunction,
	Validator,
} from '../shared/types';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionString extends SchemaTypeDefinitionBase {
	type: 'string';
	enum?: string[];
	match?: RegExp;
	foreignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
}

/** String Schema Type */
class StringType extends BaseScalarType {
	/** Array of allowed enumerations */
	private enum: string[] | null;

	/* Regular expression to validate the property value against */
	private match: RegExp | null;

	/* Transform schema foreign key definitions to the db format */
	private foreignKeyDbTransformer: ForeignKeyDbTransformer;

	public constructor(
		definition: SchemaTypeDefinitionString,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		this.enum = definition.enum ?? null;
		this.match = definition.match ?? null;
		this.foreignKeyDbTransformer = new ForeignKeyDbTransformer(definition.foreignKey);

		// add validators for this type
		this.validators.unshift(StringType.handleMatchValidation(this.validateMatch));
		this.validators.unshift(StringType.handleEnumValidation(this.validateEnum));
	}

	/** Create validation object for enum validation */
	private static handleEnumValidation(defaultValidator: ValidationFunction): Validator {
		const message = 'Value not present in list of allowed values';

		return { validator: defaultValidator, message };
	}

	/** Create validation object for match validation */
	private static handleMatchValidation(defaultValidator: ValidationFunction): Validator {
		const message = 'Value does not match pattern';

		return { validator: defaultValidator, message };
	}

	/** Transform mv string to js string */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			// if this property has an enumeration constraint and one of those constraints is empty string then return empty string;
			// otherwise return null
			return this.enum != null && this.enum.includes('') ? '' : null;
		}

		return String(value);
	}

	/** Transform js string to mv string */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return value == null ? null : String(value);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return this.foreignKeyDbTransformer.transform(value);
	}

	/** String required validator */
	protected override validateRequired = async (value: unknown): Promise<boolean> =>
		Promise.resolve(value != null && value !== '');

	/** Enum validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private validateEnum = async (value: any): Promise<boolean> =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		Promise.resolve(value == null || this.enum == null || this.enum.includes(value));

	/** Match validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private validateMatch = async (value: any): Promise<boolean> =>
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		Promise.resolve(value == null || this.match == null || this.match.test(value));
}

export default StringType;
