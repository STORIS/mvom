import { DisallowDirectError } from '#shared/Errors';
import SimpleType from './SimpleType';

/**
 * A Base Type for all date types
 * @extends SimpleType
 * @hideconstructor
 * @param {Object} [definition] - Data definition
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 */
class BaseDateType extends SimpleType {
	constructor(definition) {
		if (new.target === BaseDateType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'BaseDateType' });
		}

		super(definition);
	}

	/* public instance methods */

	/**
	 * Transform query constants to internal u2 date format
	 * @function transformToQuery
	 * @memberof BaseDateType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - String ISO date or time format
	 * @returns {string} U2 Internally formatted date or time
	 */
	transformToQuery = value => (value === '' || value == null ? '' : this.transformToDb(value));
}

export default BaseDateType;
