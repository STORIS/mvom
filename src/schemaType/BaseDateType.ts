import BaseScalarType from './BaseScalarType';

/** Base Type for all date types */
abstract class BaseDateType extends BaseScalarType {
	/** Transform query constants to internal u2 date format */
	public override transformToQuery(value: unknown): unknown {
		return value === '' || value == null ? '' : this.transformToDb(value);
	}
}

export default BaseDateType;
