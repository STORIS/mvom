import { InvalidParameterError, TransformDataError } from '../errors';
import { handleTypeValidation } from '../validators';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionNumber extends SchemaTypeDefinitionBase {
	type: 'number';
	dbDecimals?: number;
}

/**
 * Number Schema Type
 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
 */
class NumberType extends BaseScalarType {
	/** Number of implied decimals in database storage */
	private readonly dbDecimals: number;

	public constructor(
		definition: SchemaTypeDefinitionNumber,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbDecimals = 0 } = definition;

		if (!Number.isInteger(dbDecimals)) {
			throw new InvalidParameterError({ parameterName: 'definition.dbDecimals' });
		}

		this.dbDecimals = dbDecimals;

		// add validators for this type
		this.validators.unshift(handleTypeValidation(this.validateType));
	}

	/**
	 * Transform mv style internally formatted numeric data (nnnnn) to externally formatted numeric data (nnn.nn)
	 * @throws {@link TransformDataError} Database value could not be transformed to external format
	 */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): number;
	public transformFromDb(value: unknown): number | null {
		if (value == null) {
			return null;
		}
		const castValue = Number(value);
		if (!Number.isFinite(castValue)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		return Number((Math.round(castValue) / 10 ** this.dbDecimals).toFixed(this.dbDecimals));
	}

	/** Transform externally formatted numeric data (nnn.nn) to mv style internally formatted numeric data */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return value == null ? null : (Number(value) * 10 ** this.dbDecimals).toFixed(0);
	}

	/** NumberType data type validator */
	private validateType = async (value: unknown): Promise<boolean> =>
		Promise.resolve(value == null || Number.isFinite(Number(value)));
}

export default NumberType;
