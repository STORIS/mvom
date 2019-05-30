import { expectType } from 'tsd';
import { Schema, ISOTimeType, ISOCalendarDateType, ISOCalendarDateTimeType } from "../../src/";

const schema: Schema = new Schema({test: 'foo'});
expectType<Schema>(new Schema({test: 'foo'}, { typeProperty: 'type', dictionaries: {} })); // include optional params

// Schema Types
expectType<typeof ISOCalendarDateTimeType>(Schema.Types.ISOCalendarDateTime);
expectType<typeof ISOCalendarDateType>(Schema.Types.ISOCalendarDate);
expectType<typeof ISOTimeType>(Schema.Types.ISOTime);
