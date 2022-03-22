import { isValid, parse } from 'date-fns';
import { ISOCalendarDateFormat } from '../constants';
import { ISOCalendarDateDataTransformer } from '../dataTransformers';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionISOCalendarDate extends SchemaTypeDefinitionBase {
	type: 'ISOCalendarDate';
}

/** ISOCalendarDate Schema Type */
class ISOCalendarDateType extends BaseScalarType {
	/** Data transformer */
	protected readonly dataTransformer: ISOCalendarDateDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDate,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		this.dataTransformer = new ISOCalendarDateDataTransformer();
	}

	/** ISOCalendarDateType data type validator */
	protected override validateType = (value: unknown): boolean => {
		if (value == null) {
			return true;
		}

		if (typeof value !== 'string') {
			return false;
		}

		return isValid(this.parseISOCalendarDate(value));
	};

	/** Parse ISOCalendarDate string into date */
	private parseISOCalendarDate(value: string) {
		return parse(value, ISOCalendarDateFormat, new Date());
	}
}

export default ISOCalendarDateType;
