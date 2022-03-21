import { ISOCalendarDateTimeDataTransformer } from '../dataTransformers';
import type Document from '../Document';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';

export interface SchemaTypeDefinitionISOCalendarDateTime extends SchemaTypeDefinitionBase {
	type: 'ISOCalendarDateTime';
	dbFormat?: 's' | 'ms';
}

/** An ISOCalendarDateTime Schema Type */
class ISOCalendarDateTimeType extends BaseScalarType {
	/** ISOCalendarDateType instance to use for transformations and validations of the date part of the DateTime */
	private readonly isoCalendarDateType: ISOCalendarDateType;

	/** ISOTimeType instance to use for transformations and validations of the time part of the DateTime */
	private readonly isoTimeType: ISOTimeType;

	/** Data transformer */
	private readonly dataTransformer: ISOCalendarDateTimeDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDateTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		const { dbFormat = 'ms' } = definition;

		this.isoCalendarDateType = new ISOCalendarDateType(
			{ ...definition, type: 'ISOCalendarDate' },
			options,
		);
		this.isoTimeType = new ISOTimeType({ ...definition, type: 'ISOTime', dbFormat }, options);

		this.dataTransformer = new ISOCalendarDateTimeDataTransformer(dbFormat);
	}

	/** Transform mv style timestamp data (ddddd.sssss[SSS]) to ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) to mv style timestamp data (ddddd.sssss[SSS]) */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to internal u2 date-time */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
	}

	/** ISOCalendarDateTime data type validator */
	protected override validateType = async (
		value: unknown,
		document: Document,
	): Promise<boolean> => {
		if (value == null) {
			return true;
		}

		if (typeof value !== 'string') {
			// must be a string value
			return false;
		}

		const [datePart, timePart] = value.split('T');

		const partsValidations = (
			await Promise.all([
				this.isoCalendarDateType.validate(datePart, document),
				this.isoTimeType.validate(timePart, document),
			])
		).flat();

		return partsValidations.length === 0;
	};
}

export default ISOCalendarDateTimeType;
