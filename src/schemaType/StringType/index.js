import SimpleType from 'schemaType/SimpleType';
import InvalidParameterError from 'Errors/InvalidParameter';

/**
 * A String Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class StringType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		super(definition);
	}

	/**
	 * Transform mv string to js string
	 * @function transformFromDb
	 * @memberof StringType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string} Transformed value
	 */
	transformFromDb = value => {
		if (value == null) {
			return String();
		}
		return String(value);
	};

	/**
	 * Transform js string to mv string
	 * @function transformToDb
	 * @memberof StringType
	 * @instance
	 * @public
	 * @override
	 * @param {string|null} value - Value to transform
	 * @returns {string|null} Transformed value
	 */
	transformToDb = value => {
		if (value == null) {
			return null;
		}
		return String(value);
	};
}

export default StringType;
