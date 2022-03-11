import moment from 'moment';
import { ISOCalendarDateFormat, mvEpoch } from '../constants';
import { TransformDataError } from '../errors';
import BaseDateType from './BaseDateType';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionISOCalendarDate extends SchemaTypeDefinitionBase {
	type: 'ISOCalendarDate';
}

/** ISOCalendarDate Schema Type */
class ISOCalendarDateType extends BaseDateType {
	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDate,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);
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

		return moment(mvEpoch).add(castValue, 'days').format(ISOCalendarDateFormat);
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

		return String(moment(value).diff(moment(mvEpoch), 'days'));
	}

	/** ISOCalendarDateType data type validator */
	protected override validateType = (value: unknown): boolean => {
		if (value == null) {
			return true;
		}

		if (typeof value !== 'string') {
			return false;
		}

		return moment(value, ISOCalendarDateFormat).isValid();
	};
}

export default ISOCalendarDateType;
