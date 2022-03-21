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
	private readonly dataTransformer: ISOCalendarDateDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionISOCalendarDate,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);

		this.dataTransformer = new ISOCalendarDateDataTransformer();
	}

	/** transform mv date data to ISO 8601 approved date format (yyyy-mm-dd) */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform ISO 8601 approved date format (yyyy-mm-dd) to mv date data */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to internal u2 date format */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
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
