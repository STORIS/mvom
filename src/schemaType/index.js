import ArrayType from './ArrayType';
import BooleanType from './BooleanType';
import DocumentArrayType from './DocumentArrayType';
import EmbeddedType from './EmbeddedType';
import ISOCalendarDateTimeType from './ISOCalendarDateTimeType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';
import NestedArrayType from './NestedArrayType';
import NumberType from './NumberType';
import StringType from './StringType';

const schemaType = {
	Array: ArrayType,
	Boolean: BooleanType,
	DocumentArray: DocumentArrayType,
	Embedded: EmbeddedType,
	ISOCalendarDateTime: ISOCalendarDateTimeType,
	ISOCalendarDate: ISOCalendarDateType,
	ISOTime: ISOTimeType,
	NestedArray: NestedArrayType,
	Number: NumberType,
	String: StringType,
};

export default schemaType;
