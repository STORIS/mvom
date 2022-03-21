import { isValid, parse } from 'date-fns';
import { ISOTimeFormat } from '../constants';
import { ISOTimeDataTransformer } from '../dataTransformers';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import BaseScalarType from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionISOTime extends SchemaTypeDefinitionBase {
	type: 'ISOTime';
	dbFormat?: 's' | 'ms';
}

/** ISOTime Schema Type */
class ISOTimeType extends BaseScalarType {
	/** Data transformer */
	private readonly dataTransformer: ISOTimeDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionISOTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);
		const { dbFormat } = definition;

		this.dataTransformer = new ISOTimeDataTransformer(dbFormat);
	}

	/** Transform mv style time data to ISO 8601 approved time format (HH:mm:ss.SSS) */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform ISO 8601 approved time format (HH:mm:ss.SSS) to mv style time data */
	public transformToDb(value: null): null;
	public transformToDb(value: unknown): string;
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to internal u2 time format */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
	}

	/** ISOTimeType data type validator */
	protected override validateType = (value: unknown): boolean => {
		if (value == null) {
			return true;
		}

		if (typeof value !== 'string') {
			return false;
		}

		return isValid(this.parseISOTime(value));
	};

	/** Parse ISOTime string into date */
	private parseISOTime(value: string) {
		return parse(value, ISOTimeFormat, new Date());
	}
}

export default ISOTimeType;
