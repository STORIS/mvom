import { isString } from 'lodash';
import { InvalidParameterError } from '#shared/errors';
import { handleTypeValidation } from '#shared/utils';
import BaseDateType from './BaseDateType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';

/**
 * An ISOCalendarDateTime Schema Type
 * @extends BaseDateType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {string} [definition.dbFormat = 'ms'] - Allowed values: 's' & 'ms'; indicates whether time is stored in seconds or milliseconds past midnight
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class ISOCalendarDateTimeType extends BaseDateType {
	constructor(definition) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
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

		// add validators for this type
		this._validators.unshift(handleTypeValidation(this._validateType));
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
	 * @returns {string|null} Transformed ISO 8601 String date/time value (yyyy-mm-ddTHH:mm:ss.SSS)
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
	 */
	transformFromDb(value) {
		if (value == null) {
			return null;
		}
		const valueParts = String(value).split('.');

		const datePart = new ISOCalendarDateType({}).transformFromDb(+valueParts[0]);
		const timePart = new ISOTimeType({ dbFormat: this._dbFormat }).transformFromDb(+valueParts[1]);

		return `${datePart}T${timePart}`;
	}

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
	transformToDb(value) {
		if (value == null) {
			return null;
		}

		const [datePart, timePart] = value.split('T');
		const padLength = this._dbFormat === 'ms' ? 8 : 5;

		return `${new ISOCalendarDateType({}).transformToDb(datePart)}.${new ISOTimeType({
			dbFormat: this._dbFormat,
		})
			.transformToDb(timePart)
			.padStart(padLength, '0')}`;
	}

	/* private instance methods */

	/**
	 * ISOCalendarDateTime data type validator
	 * @function _validateType
	 * @memberof ISOCalendarDateTimeType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Value to validate for data type casting
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateType = async (value) => {
		if (value == null) {
			return true;
		}

		if (!isString(value)) {
			// must be a string value
			return false;
		}

		const [datePart, timePart] = value.split('T');

		if (datePart === '' || timePart === '' || timePart == null) {
			// compound type must contain both parts
			return false;
		}

		return (
			(await new ISOCalendarDateType({}).validate(datePart)) &&
			new ISOTimeType({ dbFormat: this._dbFormat }).validate(timePart)
		);
	};
}

export default ISOCalendarDateTimeType;
