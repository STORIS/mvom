import moment from 'moment';
import SimpleType from 'schemaType/SimpleType';

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
	 * Transform mv data data to ISO 8601 approved date format (yyyy-mm-dd)
	 * @function transformFromDb
	 * @memberof ISOCalendarDateType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {string|null} Transformed ISO 8601 String Date value (yyyy-mm-dd)
	 * @throws {Error}
	 */
	transformFromDb = value => {
		if (value == null) {
			return null;
		}
		const castValue = +value;
		if (!Number.isInteger(castValue)) {
			throw new Error();
		}

		return moment(ISOCalendarDateType.epoch)
			.add(castValue, 'days')
			.format('YYYY-MM-DD');
	};
}

export default ISOCalendarDateType;
