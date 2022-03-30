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
	protected readonly dataTransformer: ISOTimeDataTransformer;

	public constructor(
		definition: SchemaTypeDefinitionISOTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);
		const { dbFormat } = definition;

		this.dataTransformer = new ISOTimeDataTransformer(dbFormat);
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
