import moment from 'moment';
import { ISOTimeFormat } from '../constants';
import { TransformDataError } from '../errors';
import { createTypeValidator } from '../validators';
import BaseDateType from './BaseDateType';
import type { ScalarTypeConstructorOptions } from './BaseScalarType';
import type { SchemaTypeDefinitionBase } from './BaseSchemaType';

export interface SchemaTypeDefinitionISOTime extends SchemaTypeDefinitionBase {
	type: 'ISOTime';
	dbFormat?: 's' | 'ms';
}

/** ISOTime Schema Type */
class ISOTimeType extends BaseDateType {
	/** Database time format is in milliseconds */
	private readonly isDbInMs: boolean;

	public constructor(
		definition: SchemaTypeDefinitionISOTime,
		options: ScalarTypeConstructorOptions = {},
	) {
		super(definition, options);
		const { dbFormat = 's' } = definition;
		this.isDbInMs = dbFormat === 'ms';

		// add validators for this type
		this.validators.unshift(createTypeValidator(this.validateType));
	}

	/**
	 * Transform mv style time data to ISO 8601 approved time format (HH:mm:ss.SSS)
	 * @throws {@link TransformDataError} Database value could not be transformed to external format
	 */
	public transformFromDb(value: null): null;
	public transformFromDb(value: unknown): string;
	public transformFromDb(value: unknown): string | null {
		if (value == null) {
			return null;
		}
		const castValue = Number(value);
		if (!Number.isInteger(castValue) || castValue < 0) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		if (castValue > 86400000 || (!this.isDbInMs && castValue > 86400)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		const isoTime = moment().startOf('day');

		if (this.isDbInMs) {
			isoTime.add(castValue, 'milliseconds');
		} else {
			isoTime.add(castValue, 'seconds');
		}

		return isoTime.format(ISOTimeFormat);
	}

	/**
	 * Transform ISO 8601 approved time format (HH:mm:ss.SSS) to mv style time data
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

		const startOfDay = moment().startOf('day');

		if (this.isDbInMs) {
			return String(moment(value, ISOTimeFormat).diff(startOfDay, 'milliseconds'));
		}
		return String(moment(value, ISOTimeFormat).diff(startOfDay, 'seconds'));
	}

	/** ISOTimeType data type validator */
	private validateType = async (value: unknown): Promise<boolean> => {
		if (value == null) {
			return Promise.resolve(true);
		}

		if (typeof value !== 'string') {
			return Promise.resolve(false);
		}

		return Promise.resolve(moment(value, ISOTimeFormat).isValid());
	};
}

export default ISOTimeType;
