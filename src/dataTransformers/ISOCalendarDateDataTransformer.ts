import { addDays, differenceInDays, format, parse } from 'date-fns';
import { ISOCalendarDateFormat, mvEpoch } from '../constants';
import { TransformDataError } from '../errors';
import type { DataTransformer } from '../types';

/** ISOCalendarDate Data Transformer */
class ISOCalendarDateDataTransformer implements DataTransformer {
	/** Transform query constants to internal u2 date format */
	public transformToQuery(value: unknown): string {
		return value === '' || value == null ? '' : this.transformToDb(value);
	}

	/**
	 * Transform mv date data to ISO 8601 approved date format (yyyy-mm-dd)
	 * @throws {@link TransformDataError} Database value could not be transformed to external format
	 */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const castValue = Number(value);
		if (!Number.isInteger(castValue)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		return format(addDays(mvEpoch, castValue), ISOCalendarDateFormat);
	}

	/**
	 * Transform ISO 8601 approved date format (yyyy-mm-dd) to mv date data
	 * @throws {@link TransformDataError} Value could not be transformed to database format
	 */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}

		if (typeof value !== 'string') {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: value,
			});
		}

		return String(differenceInDays(this.parseISOCalendarDate(value), mvEpoch));
	}

	/** Parse ISOCalendarDate string into date */
	private parseISOCalendarDate(value: string) {
		return parse(value, ISOCalendarDateFormat, new Date());
	}
}

export default ISOCalendarDateDataTransformer;
