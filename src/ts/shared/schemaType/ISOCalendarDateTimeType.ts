import { TransformDataError } from '#shared/errors';
import type { GenericObject } from '#shared/types';
import { handleTypeValidation } from '#shared/utils';
import BaseDateType from './BaseDateType';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';

export interface SchemaTypeDefinitionISOCalendarDateTime extends SchemaTypeDefinitionBase {
	type: 'ISOCalendarDateTime';
	dbFormat?: 's' | 'ms';
}

/** An ISOCalendarDateTime Schema Type */
class ISOCalendarDateTimeType extends BaseDateType {
	/** Database time format is in milliseconds */
	private isDbInMs: boolean;

	/** ISOCalendarDateType instance to use for transformations and validations of the date part of the DateTime */
	private isoCalendarDateType: ISOCalendarDateType;

	/** ISOTimeType instance to use for transformations and validations of the time part of the DateTime */
	private isoTimeType: ISOTimeType;

	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDateTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbFormat = 'ms' } = definition;
		this.isDbInMs = dbFormat === 'ms';

		this.isoCalendarDateType = new ISOCalendarDateType(
			{ ...definition, type: 'ISOCalendarDate' },
			options,
		);
		this.isoTimeType = new ISOTimeType({ ...definition, type: 'ISOTime' }, options);

		// add validators for this type
		this.validators.unshift(handleTypeValidation(this.validateType));
	}

	/** Transform mv style timestamp data (ddddd.sssss[SSS]) to ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) */
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const valueParts = String(value).split('.');

		const datePart = this.isoCalendarDateType.transformFromDb(+valueParts[0]);
		const timePart = this.isoTimeType.transformFromDb(+valueParts[1]);

		return `${datePart}T${timePart}`;
	}

	/**
	 * Transform ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) to mv style timestamp data (ddddd.sssss[SSS])
	 * @throws {@link TransformDataError} Value could not be transformed to database format
	 */
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

		const transformedDatePart = this.isoCalendarDateType.transformToDb(datePart);
		const transformedTimePart = this.isoTimeType.transformToDb(timePart)?.padStart(padLength, '0');

		if (transformedDatePart == null || transformedTimePart == null) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: value,
			});
		}

		return `${transformedDatePart}.${transformedTimePart}`;
	}

	/** ISOCalendarDateTime data type validator */
	private validateType = async (value: unknown, document: GenericObject): Promise<boolean> => {
		if (value == null) {
			return true;
		}

		if (typeof value !== 'string') {
			// must be a string value
			return false;
		}

		const [datePart, timePart] = value.split('T');

		if (datePart === '' || timePart === '' || timePart == null) {
			// compound type must contain both parts
			return false;
		}

		const partsValidations = (
			await Promise.all([
				this.isoCalendarDateType.validate(datePart, document),
				this.isoTimeType.validate(timePart, document),
			])
		).flat();

		return partsValidations.length > 0;
	};
}

export default ISOCalendarDateTimeType;
