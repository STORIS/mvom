import { TransformDataError } from '../errors';
import type { DataTransformer } from '../types';
import ISOCalendarDateDataTransformer from './ISOCalendarDateDataTransformer';
import ISOTimeDataTransformer from './ISOTimeDataTransformer';

/** ISOCalendarDateTime Data Transformer */
class ISOCalendarDateTimeDataTransformer implements DataTransformer {
	/** Database time format is in milliseconds */
	private readonly isDbInMs: boolean;

	/** ISOCalendarDateDataTransformer instance to use for transformations of the date part of the DateTime */
	private readonly isoCalendarDateTransformer: ISOCalendarDateDataTransformer;

	/** ISOTimeDataTransformer instance to use for transformations of the time part of the DateTime */
	private readonly isoTimeTransformer: ISOTimeDataTransformer;

	public constructor(dbFormat: 's' | 'ms' = 'ms') {
		this.isDbInMs = dbFormat === 'ms';

		this.isoCalendarDateTransformer = new ISOCalendarDateDataTransformer();
		this.isoTimeTransformer = new ISOTimeDataTransformer(dbFormat);
	}

	/** Transform query constants to internal u2 date-time */
	public transformToQuery(value: unknown): string {
		return value === '' || value == null ? '' : this.transformToDb(value);
	}

	/** Transform mv style timestamp data (ddddd.sssss[SSS]) to ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const valueParts = String(value).split('.');

		const datePart = this.isoCalendarDateTransformer.transformFromDb(+valueParts[0]);
		const timePart = this.isoTimeTransformer.transformFromDb(+valueParts[1]);

		return `${datePart}T${timePart}`;
	}

	/**
	 * Transform ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) to mv style timestamp data (ddddd.sssss[SSS])
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

		const [datePart, timePart] = value.split('T');
		const padLength = this.isDbInMs ? 8 : 5;

		const transformedDatePart = this.isoCalendarDateTransformer.transformToDb(datePart);
		const transformedTimePart = this.isoTimeTransformer
			.transformToDb(timePart)
			.padStart(padLength, '0');

		return `${transformedDatePart}.${transformedTimePart}`;
	}
}

export default ISOCalendarDateTimeDataTransformer;
