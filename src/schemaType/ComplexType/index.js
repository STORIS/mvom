import BaseType from 'schemaType/BaseType';

/**
 * A Complex Schema Type
 * @hideconstructor
 * @interface
 * @throws {Error}
 */
class ComplexType extends BaseType {
	constructor() {
		if (new.target === ComplexType) {
			// disallow direct instantiation
			throw new Error();
		}

		super();
	}
}

export default ComplexType;
