import BaseScalarType from './BaseScalarType';

/** Boolean Schema Type */
class BooleanType extends BaseScalarType {
	/** Transform mv style data to Boolean */

	public transformFromDb(value: unknown): boolean {
		// this logic is intentionally trying to mimic the Boolean rules of the UniBasic interpreter
		return value != null && value !== '0' && value !== 0;
	}

	/** Transform js style data to mv style data */
	public transformToDb(value: unknown): '1' | '0' {
		return value ? '1' : '0';
	}

	/** Transform query constants to u2 formatted Boolean */
	public override transformToQuery(value: unknown): '1' | '0' | unknown {
		if (value === true || value === 'true' || value === 'TRUE') {
			return '1';
		}

		if (value === false || value === 'false' || value === 'FALSE') {
			return '0';
		}

		return value;
	}
}

export default BooleanType;
