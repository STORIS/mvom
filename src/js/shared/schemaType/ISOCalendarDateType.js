import moment from 'moment';
import { TransformDataError } from '#shared/errors';
import { mvEpoch, ISOCalendarDateFormat } from '#shared/constants';
import { handleTypeValidation } from '#shared/utils';
import BaseDateType from './BaseDateType';

/**
 * An ISOCalendarDate Schema Type
 * @extends BaseDateType
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 * @param {Object} [options = {}]
 * @param {Function} [options.encrypt] Encryption function to use to encrypt sensitive fields
 * @param {Function} [options.decrypt] Decryption function to use to decrypt sensitive fields
 */
class ISOCalendarDateType extends BaseDateType {
	/* static properties */

	constructor(definition, options) {
		super(definition, options);

		// add validators for this type
		this._validators.unshift(handleTypeValidation(this._validateType));
	}

	/* public instance methods */

	/**
	 * Transform mv date data to ISO 8601 approved date format (yyyy-mm-dd)
	 * @function transformFromDb
	 * @memberof ISOCalendarDateType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {string|null} Transformed ISO 8601 String Date value (yyyy-mm-dd)
	 * @throws {TransformDataError} Database value could not be transformed to external format
	 */
	transformFromDb(value) {
		if (value == null) {
			return null;
		}
		const castValue = +value;
		if (!Number.isInteger(castValue)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		return moment(mvEpoch).add(castValue, 'days').format(ISOCalendarDateFormat);
	}

	/**
	 * Transform ISO 8601 approved date format (yyyy-mm-dd) to mv date data
	 * @function transformToDb
	 * @memberof ISOCalendarDateType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed string integer representing number of days since mv epoch
	 */
	transformToDb(value) {
		return value == null ? null : String(moment(value).diff(moment(mvEpoch), 'days'));
	}

	/* private instance methods */

	/**
	 * ISOCalendarDateType data type validator
	 * @function _validateType
	 * @memberof ISOCalendarDateType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Value to validate for data type casting
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	async _validateType(value) {
		return value == null || moment(value, ISOCalendarDateFormat).isValid();
	}
}

export default ISOCalendarDateType;
