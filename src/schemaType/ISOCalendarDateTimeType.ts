import { ISOCalendarDateTimeDataTransformer } from '../dataTransformers';
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
	/** Data transformer */
	protected readonly dataTransformer: ISOCalendarDateTimeDataTransformer;

	/** ISOCalendarDateType instance to use for transformations and validations of the date part of the DateTime */
	private readonly isoCalendarDateType: ISOCalendarDateType;

	/** ISOTimeType instance to use for transformations and validations of the time part of the DateTime */
	private readonly isoTimeType: ISOTimeType;

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

	/** ISOCalendarDateTime data type validator */
	protected override validateType = async (value: unknown): Promise<boolean> => {
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
				this.isoCalendarDateType.validate(datePart),
				this.isoTimeType.validate(timePart),
			])
		).flat();

		return partsValidations.length === 0;
	};
}

export default ISOCalendarDateTimeType;
