import SimpleType from 'schemaType/SimpleType';

/**
 * A String Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @throws {Error}
 */
class StringType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new Error();
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
}

export default StringType;
