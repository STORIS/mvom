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
	 * Transform mv style time data to ISO 8601 approved time format (kk:mm:ss.SSS)
	 * @function transformFromDb
	 * @memberof ISOTimeType
	 * @instance
	 * @public
	 * @override
	 * @param {integer} value - Value to transform
	 * @returns {string} Transformed ISO 8601 String Time value (kk:mm:ss.SSS)
	 * @throws {Error}
	 */
	transformFromDb = value => {
		if (!Number.isInteger(value) || value < 0) {
			throw new Error();
		}

		if ((this._isDbInMs && value > 86400000) || (!this._isDbInMs && value > 86400)) {
			throw new Error();
		}

		const isoTime = moment().startOf('day');

		if (this._isDbInMs) {
			isoTime.add(value, 'milliseconds');
		} else {
			isoTime.add(value, 'seconds');
		}

		return isoTime.format('kk:mm:ss.SSS');
	};
}

export default ISOTimeType;
