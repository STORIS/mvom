import BooleanType from './BooleanType';
import ISOCalendarDateTimeType from './ISOCalendarDateTimeType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';
import NumberType from './NumberType';
import StringType from './StringType';

const schemaType = {
	Boolean: BooleanType,
	ISOCalendarDateTime: ISOCalendarDateTimeType,
	ISOCalendarDate: ISOCalendarDateType,
	ISOTime: ISOTimeType,
	Number: NumberType,
	String: StringType,
};

export default schemaType;
