import { DisallowDirectError } from '#shared/errors';
import SimpleType from './SimpleType';

/**
 * A Base Type for all date types
 * @extends SimpleType
 * @hideconstructor
 * @param {Object} [definition] - Data definition
 * @param {Object} [options = {}]
 * @param {Function} [options.encrypt] Encryption function to use to encrypt sensitive fields
 * @param {Function} [options.decrypt] Decryption function to use to decrypt sensitive fields
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 */
class BaseDateType extends SimpleType {
	constructor(definition, options) {
		if (new.target === BaseDateType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'BaseDateType' });
		}

		super(definition, options);
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
