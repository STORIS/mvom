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
}

export default StringType;
