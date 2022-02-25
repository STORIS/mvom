import { InvalidParameterError, TransformDataError } from '#shared/errors';
import type { GenericObject } from '#shared/types';
import { handleTypeValidation } from '#shared/utils';
import BaseScalarType from './BaseScalarType';

/**
 * Number Schema Type
 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
 */
class NumberType extends BaseScalarType {
	/** Number of implied decimals in database storage */
	private dbDecimals: number;

	public constructor(definition: GenericObject) {
		super(definition);

		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
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
	public transformToDb(value: unknown): string | null {
		return value == null ? null : (Number(value) * 10 ** this.dbDecimals).toFixed(0);
	}

	/** NumberType data type validator */
	private async validateType(value: unknown): Promise<boolean> {
		return Promise.resolve(value == null || Number.isFinite(Number(value)));
	}
}

export default NumberType;
