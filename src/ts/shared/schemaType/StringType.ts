import { ForeignKeyDbTransformer } from '#shared/classes';
import type { ForeignKeyDbDefinition } from '#shared/classes/ForeignKeyDbTransformer';
import { InvalidParameterError } from '#shared/errors';
import type { GenericObject, ValidationFunction, Validator } from '#shared/types';
import type { ScalarTypeConstructorOptions } from './ScalarType';
import ScalarType from './ScalarType';

/** String Schema Type */
class StringType extends ScalarType {
	/** Array of allowed enumerations */
	private enum: string[] | null;

	/* Regular expression to validate the property value against */
	private match: RegExp | null;

	/* Transform schema foreign key definitions to the db format */
	private foreignKeyDbTransformer: ForeignKeyDbTransformer;

	public constructor(definition: GenericObject, options: ScalarTypeConstructorOptions) {
		super(definition, options);

		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		if (definition.enum != null && !Array.isArray(definition.enum)) {
			throw new InvalidParameterError({ parameterName: 'definition.enum' });
		}
		if (definition.match != null && !(definition.match instanceof RegExp)) {
			throw new InvalidParameterError({ parameterName: 'definition.match' });
		}

		this.enum = definition.enum ?? null;
		this.match = definition.match ?? null;
		this.foreignKeyDbTransformer = new ForeignKeyDbTransformer(definition.foreignKey);

		// add validators for this type
		this.validators.unshift(StringType.matchValidation(this.validateMatch));
		this.validators.unshift(StringType.handleEnumValidation(this.validateEnum));
	}

	/** Create validation object for enum validation */
	private static handleEnumValidation(defaultValidator: ValidationFunction): Validator {
		const message = 'Value not present in list of allowed values';

		return { validator: defaultValidator, message };
	}

	/** Create validation object for match validation */
	private static matchValidation(defaultValidator: ValidationFunction): Validator {
		const message = 'Value does not match pattern';

		return { validator: defaultValidator, message };
	}

	/** Transform mv string to js string */
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			// if this property has an enumeration constraint and one of those constraints is empty string then return empty string;
			// otherwise return null
			return this.enum !== null && this.enum.includes('') ? '' : null;
		}

		return String(value);
	}

	/** Transform js string to mv string */
	public transformToDb(value: unknown): string | null {
		return value == null ? null : String(value);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return this.foreignKeyDbTransformer.transform(value);
	}

	/** String required validator */
	protected override async validateRequired(value: unknown): Promise<boolean> {
		return Promise.resolve(value != null && value !== '');
	}

	/** Enum validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async validateEnum(value: any): Promise<boolean> {
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		return Promise.resolve(value == null || this.enum == null || this.enum.includes(value));
	}

	/** Match validator */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async validateMatch(value: any): Promise<boolean> {
		// skip validation on nullish values because a required validation error, if applicable, is more helpful
		return Promise.resolve(value == null || this.match == null || this.match.test(value));
	}
}

export default StringType;
