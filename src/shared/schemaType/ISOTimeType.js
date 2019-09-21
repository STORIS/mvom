import moment from 'moment';
import { TransformDataError } from '#shared/Errors';
import { ISOTimeFormat } from '#shared/constants';
import { handleTypeValidation } from '#shared/helpers';
import BaseDateType from './BaseDateType';

/**
 * An ISOTime Schema Type
 * @extends BaseDateType
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 * @param {string} [definition.dbFormat = 's'] - Allowed values: 's' & 'ms'; indicates whether time is stored in seconds or milliseconds past midnight
 */
class ISOTimeType extends BaseDateType {
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

		// add validators for this type
		this._validators.unshift(handleTypeValidation(this._validateType));
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
	 * @throws {TransformDataError} Database value could not be transformed to external format
	 */
	transformFromDb = value => {
		if (value == null) {
			return null;
		}
		const castValue = +value;
		if (!Number.isInteger(castValue) || castValue < 0) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		if (castValue > 86400000 || (!this._isDbInMs && castValue > 86400)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		const isoTime = moment().startOf('day');

		if (this._isDbInMs) {
			isoTime.add(castValue, 'milliseconds');
		} else {
			isoTime.add(castValue, 'seconds');
		}

		return isoTime.format(ISOTimeFormat);
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
			return String(moment(value, ISOTimeFormat).diff(startOfDay, 'milliseconds'));
		}
		return String(moment(value, ISOTimeFormat).diff(startOfDay, 'seconds'));
	};

	/* private instance methods */

	/**
	 * ISOTimeType data type validator
	 * @function _validateType
	 * @memberof ISOTimeType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Value to validate for data type casting
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateType = async value => value == null || moment(value, ISOTimeFormat).isValid();
}

export default ISOTimeType;
