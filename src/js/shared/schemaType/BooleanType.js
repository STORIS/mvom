import { InvalidParameterError } from '#shared/errors';
import SimpleType from './SimpleType';

/**
 * A Boolean Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class BooleanType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		super(definition);
	}

	/* public instance methods */

	/**
	 * Transform mv style data to Boolean
	 * @function transformFromDb
	 * @memberof BooleanType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {Boolean} Transformed value
	 */
	transformFromDb = value =>
		// this logic is intentionally trying to mimic the Boolean rules of the UniBasic interpreter
		value != null && value !== '0' && value !== 0;

	/**
	 * Transform js style data to mv style data
	 * @function transformToDb
	 * @memberof BooleanType
	 * @instance
	 * @public
	 * @override
	 * @param {Boolean} value - Value to transform
	 * @returns {'1'|'0'} Transformed value
	 */
	transformToDb = value => (value ? '1' : '0');

	/**
	 * Transform query constants to u2 formatted Boolean
	 * @function transformToQuery
	 * @memberof SimpleType
	 * @instance
	 * @public
	 * @override
	 * @param {Boolean|string|*} value - Value to convert
	 * @returns {'1'|'0'|*} Returns "1" if boolean or string true, "0" if boolean or string false, and original value if anything else
	 */
	transformToQuery = value => {
		if ([true, 'true', 'TRUE'].includes(value)) {
			return '1';
		}
		if ([false, 'false', 'FALSE'].includes(value)) {
			return '0';
		}
		return value;
	};
}

export default BooleanType;
