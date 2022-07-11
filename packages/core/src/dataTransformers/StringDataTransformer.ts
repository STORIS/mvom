import type { DataTransformer } from '../types';

class StringDataTransformer implements DataTransformer {
	/** Array of allowed enumerations */
	private readonly enum: string[] | null;

	public constructor(enumList?: string[]) {
		this.enum = enumList ?? null;
	}

	/** Transform mv string to js string */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): unknown | null {
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

	/** Transform query constants to the format schema */
	public transformToQuery(value: unknown): string {
		return String(value);
	}
}

export default StringDataTransformer;
