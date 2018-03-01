import moment from 'moment';
import SimpleType from 'schemaType/SimpleType';
import TransformDataError from 'Errors/TransformData';

/**
 * An ISOCalendarDate Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 */
class ISOCalendarDateType extends SimpleType {
	/* static properties */

	static epoch = '1967-12-31';

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
			.format('YYYY-MM-DD');
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
	transformToDb = value => {
		if (value == null) {
			return null;
		}

		return String(moment(value).diff(moment(ISOCalendarDateType.epoch), 'days'));
	};
}

export default ISOCalendarDateType;
