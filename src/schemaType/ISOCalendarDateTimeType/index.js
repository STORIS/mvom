import ISOCalendarDateType from 'schemaType/ISOCalendarDateType';
import ISOTimeType from 'schemaType/ISOTimeType';
import SimpleType from 'schemaType/SimpleType';

/**
 * An ISOCalendarDateTime Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {string} [definition.dbFormat = 'ms'] - Allowed values: 's' & 'ms'; indicates whether time is stored in seconds or milliseconds past midnight
 * @throws {Error}
 */
class ISOCalendarDateTimeType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new Error();
		}
		super(definition);
		const { dbFormat = 'ms' } = definition;
		/**
		 * Format of database time storage ('s' or 'ms')
		 * @member {string} _dbFormat
		 * @memberof ISOCalendarDateTimeType
		 * @instance
		 * @private
		 */
		this._dbFormat = dbFormat;
	}

	/* public instance methods */

	/**
	 * Transform mv style timestamp data (ddddd.sssss[SSS]) to ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS)
	 * @function transformFromDb
	 * @memberof ISOCalendarDateTimeType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {string|null} Transformed ISO 8601 String Time value (HH:mm:ss.SSS)
	 */
	transformFromDb = value => {
		if (value == null) {
			return null;
		}
		const valueParts = String(value).split('.');

		const datePart = new ISOCalendarDateType({}).transformFromDb(+valueParts[0]);
		const timePart = new ISOTimeType({ dbFormat: this._dbFormat }).transformFromDb(+valueParts[1]);

		return `${datePart}T${timePart}`;
	};

	/**
	 * Transform ISO 8601 approved date/time format (yyyy-mm-ddTHH:mm:ss.SSS) to mv style timestamp data (ddddd.sssss[SSS])
	 * @function transformToDb
	 * @memberof ISOCalendarDateTimeType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed mv style timestamp value (ddddd.sssss[SSS])
	 */
	transformToDb = value => {
		if (value == null) {
			return null;
		}

		const valueParts = value.split('T');

		const datePart = new ISOCalendarDateType({}).transformToDb(valueParts[0]);
		const timePart = new ISOTimeType({ dbFormat: this._dbFormat }).transformToDb(valueParts[1]);

		return `${datePart}.${timePart}`;
	};
}

export default ISOCalendarDateTimeType;
