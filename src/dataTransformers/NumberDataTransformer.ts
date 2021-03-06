import { InvalidParameterError, TransformDataError } from '../errors';
import type { DataTransformer } from '../types';

/**
 * Number Data Transformer
 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
 */
class NumberDataTransformer implements DataTransformer {
	/** Number of implied decimals in database storage */
	private readonly dbDecimals: number;

	public constructor(dbDecimals = 0) {
		if (!Number.isInteger(dbDecimals) || dbDecimals < 0) {
			throw new InvalidParameterError({ parameterName: 'definition.dbDecimals' });
		}

		this.dbDecimals = dbDecimals;
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
				transformValue: value,
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

	/** Transform query constants to u2 formatted string number */
	public transformToQuery(value: unknown): string {
		return String(value);
	}
}

export default NumberDataTransformer;
