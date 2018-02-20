import SimpleType from 'schemaType/SimpleType';

/**
 * A Boolean Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @throws {Error}
 */
class BooleanType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new Error();
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
	transformFromDb = value => {
		// this logic is intentionally trying to mimic the Boolean rules of the UniBasic interpreter
		if (value == null || value === '0' || value === 0) {
			return false;
		}
		return true;
	};

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
}

export default BooleanType;
