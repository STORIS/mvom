import moment from 'moment';
import SimpleType from 'schemaType/SimpleType';
import TransformDataError from 'Errors/TransformData';
import handleTypeValidation from 'shared/handleTypeValidation';

/**
 * An ISOCalendarDate Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 */
class ISOCalendarDateType extends SimpleType {
	/* static properties */

	/**
	 * External format for ISO Calendar Date data
	 * @member {string} ISOCalendarDateFormat
	 * @memberof ISOCalendarDateType
	 * @static
	 */
	static ISOCalendarDateFormat = 'YYYY-MM-DD';
	/**
	 * The multivalue date epoch
	 * @member {string} epoch
	 * @memberof ISOCalendarDateType
	 * @static
	 */
	static epoch = '1967-12-31';

	constructor(definition) {
		super(definition);

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
	transformFromDb = value => {
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

		return moment(ISOCalendarDateType.epoch)
			.add(castValue, 'days')
			.format(ISOCalendarDateType.ISOCalendarDateFormat);
	};

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
	transformToDb = value =>
		value == null ? null : String(moment(value).diff(moment(ISOCalendarDateType.epoch), 'days'));

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
	_validateType = async value =>
		value == null || moment(value, ISOCalendarDateType.ISOCalendarDateFormat).isValid();
}

export default ISOCalendarDateType;
