import moment from 'moment';
import { ISOCalendarDateFormat, mvEpoch } from '#shared/constants';
import { TransformDataError } from '#shared/errors';
import type { GenericObject } from '#shared/types';
import { handleTypeValidation } from '#shared/utils';
import BaseDateType from './BaseDateType';
import type { ScalarTypeConstructorOptions } from './ScalarType';

/** ISOCalendarDate Schema Type */
class ISOCalendarDateType extends BaseDateType {
	public constructor(definition: GenericObject, options: ScalarTypeConstructorOptions) {
		super(definition, options);

		// add validators for this type
		this.validators.unshift(handleTypeValidation(this.validateType));
	}

	/**
	 * Transform mv date data to ISO 8601 approved date format (yyyy-mm-dd)
	 * @throws {@link TransformDataError} Database value could not be transformed to external format
	 */
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

		return moment(mvEpoch).add(castValue, 'days').format(ISOCalendarDateFormat);
	}

	/** Transform ISO 8601 approved date format (yyyy-mm-dd) to mv date data */
	public transformToDb(value: unknown): string | null {
		return value == null || typeof value !== 'string'
			? null
			: String(moment(value).diff(moment(mvEpoch), 'days'));
	}

	/** ISOCalendarDateType data type validator */
	private async validateType(value: unknown): Promise<boolean> {
		if (value == null) {
			return Promise.resolve(true);
		}

		if (typeof value !== 'string') {
			return Promise.resolve(false);
		}

		return Promise.resolve(moment(value, ISOCalendarDateFormat).isValid());
	}
}

export default ISOCalendarDateType;
