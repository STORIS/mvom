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
	 * Transform mv style data to js style data
	 * @function transformFromDb
	 * @memberof BooleanType
	 * @instance
	 * @public
	 * @override
	 * @param {*} value - Value to transform
	 * @returns {Boolean} Transformed value
	 */
	transformFromDb = value => Boolean(value);
}

export default BooleanType;
