import {
	hoursToMilliseconds,
	hoursToSeconds,
	minutesToMilliseconds,
	minutesToSeconds,
	secondsToMilliseconds,
} from 'date-fns';
import { TransformDataError } from '../errors';
import type { DataTransformer } from '../types';

/** ISOTime Data Transformer */
class ISOTimeDataTransformer implements DataTransformer {
	/** Database time format is in milliseconds */
	private readonly isDbInMs: boolean;

	public constructor(dbFormat: 's' | 'ms' = 's') {
		this.isDbInMs = dbFormat === 'ms';
	}

	/**
	 * Transform mv style time data to ISO 8601 approved time format (HH:mm:ss.SSS)
	 * @throws {@link TransformDataError} Database value could not be transformed to external format
	 */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const internalTime = Number(value);
		if (!Number.isInteger(internalTime) || internalTime < 0) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: internalTime,
			});
		}

		if (internalTime > 86400000 || (!this.isDbInMs && internalTime > 86400)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: internalTime,
			});
		}

		return this.convertInternalTimeToISOTime(internalTime);
	}

	/**
	 * Transform ISO 8601 approved time format (HH:mm:ss.SSS) to mv style time data
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

		const isoTimeRegex = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/; // hh:mm:ss.SSS

		const match = isoTimeRegex.exec(value);
		if (match == null) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: value,
			});
		}

		const [, hour, minute, second, millisecond] = match;

		return this.convertISOTimeToInternalTime(hour, minute, second, millisecond);
	}

	/** Transform query constants to internal u2 time format */
	public transformToQuery(value: unknown): string {
		return value === '' || value == null ? '' : this.transformToDb(value);
	}

	/** Convert internal time to ISOTime format */
	private convertInternalTimeToISOTime(internalTime: number) {
		let workingValue = internalTime;
		const multiplier = this.isDbInMs ? 1000 : 1;

		const hours = String(Math.floor(workingValue / (3600 * multiplier))).padStart(2, '0');
		workingValue %= 3600 * multiplier;

		const minutes = String(Math.floor(workingValue / (60 * multiplier))).padStart(2, '0');
		workingValue %= 60 * multiplier;

		const seconds = String(Math.floor(workingValue / multiplier)).padStart(2, '0');
		workingValue %= multiplier;

		const milliseconds = this.isDbInMs ? String(workingValue).padStart(3, '0') : '000';

		return `${hours}:${minutes}:${seconds}.${milliseconds}`;
	}

	/** Convert hours, minutes, seconds, and milliseconds to multivalue internal time format */
	private convertISOTimeToInternalTime(
		hour: string,
		minute: string,
		second: string,
		millisecond: string,
	) {
		let internalTime: number;
		if (this.isDbInMs) {
			internalTime =
				hoursToMilliseconds(Number(hour)) +
				minutesToMilliseconds(Number(minute)) +
				secondsToMilliseconds(Number(second)) +
				Number(millisecond);
		} else {
			internalTime =
				hoursToSeconds(Number(hour)) + minutesToSeconds(Number(minute)) + Number(second);
		}

		return String(internalTime);
	}
}

export default ISOTimeDataTransformer;
