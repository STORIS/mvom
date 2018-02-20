import moment from 'moment';
import SimpleType from 'schemaType/SimpleType';

/**
 * An ISOTime Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 * @param {string} [definition.dbFormat = 's'] - Allowed values: 's' & 'ms'; indicates whether time is stored in seconds or milliseconds past midnight
 */
class ISOTimeType extends SimpleType {
	constructor(definition) {
		super(definition);
		const { dbFormat = 's' } = definition;
		/**
		 * Database time format is in milliseconds
		 * @member {Boolean} _isDbInMs
		 * @memberof ISOTimeType
		 * @instance
		 * @private
		 */
		this._isDbInMs = dbFormat === 'ms';
	}

	/* public instance methods */

	/**
	 * Transform mv style time data to ISO 8601 approved time format (HH:mm:ss.SSS)
	 * @function transformFromDb
	 * @memberof ISOTimeType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {string|null} Transformed ISO 8601 String Time value (HH:mm:ss.SSS)
	 * @throws {Error}
	 */
	transformFromDb = value => {
		if (value == null) {
			return null;
		}
		const castValue = +value;
		if (!Number.isInteger(castValue) || castValue < 0) {
			throw new Error();
		}

		if ((this._isDbInMs && castValue > 86400000) || (!this._isDbInMs && castValue > 86400)) {
			throw new Error();
		}

		const isoTime = moment().startOf('day');

		if (this._isDbInMs) {
			isoTime.add(castValue, 'milliseconds');
		} else {
			isoTime.add(castValue, 'seconds');
		}

		return isoTime.format('HH:mm:ss.SSS');
	};

	/**
	 * Transform ISO 8601 approved time format (HH:mm:ss.SSS) to mv style time data
	 * @function transformToDb
	 * @memberof ISOTimeType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed string integer representing the number of seconds or milliseconds since midnight
	 */
	transformToDb = value => {
		if (value == null) {
			return null;
		}

		const startOfDay = moment().startOf('day');

		if (this._isDbInMs) {
			return String(moment(value, 'HH:mm:ss.SSS').diff(startOfDay, 'milliseconds'));
		}
		return String(moment(value, 'HH:mm:ss.SSS').diff(startOfDay, 'seconds'));
	};
}

export default ISOTimeType;
