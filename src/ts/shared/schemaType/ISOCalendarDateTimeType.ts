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
	/** Format of database time storage ('s' or 'ms') */
	private dbFormat: 's' | 'ms';

	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDateTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbFormat = 'ms' } = definition;
		this.dbFormat = dbFormat;

		// add validators for this type
		this.validators.unshift(handleTypeValidation(this.validateType));
	}

	/** Transform mv style timestamp data (ddddd.sssss[SSS]) to ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) */
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const valueParts = String(value).split('.');

		const datePart = new ISOCalendarDateType({}).transformFromDb(+valueParts[0]);
		const timePart = new ISOTimeType({ dbFormat: this.dbFormat }).transformFromDb(+valueParts[1]);

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
		const padLength = this.dbFormat === 'ms' ? 8 : 5;

		const transformedDatePart = new ISOCalendarDateType({}).transformToDb(datePart);
		const transformedTimePart = new ISOTimeType({
			dbFormat: this.dbFormat,
		})
			.transformToDb(timePart)
			?.padStart(padLength, '0');

		if (transformedDatePart == null || transformedTimePart == null) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: value,
			});
		}

		return `${transformedDatePart}.${transformedTimePart}`;
	}

	/** ISOCalendarDateTime data type validator */
	private async validateType(value: unknown, document: GenericObject): Promise<boolean> {
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
				new ISOCalendarDateType({}).validate(datePart, document),
				new ISOTimeType({ dbFormat: this.dbFormat }).validate(timePart, document),
			])
		).flat();

		return partsValidations.length > 0;
	}
}

export default ISOCalendarDateTimeType;
