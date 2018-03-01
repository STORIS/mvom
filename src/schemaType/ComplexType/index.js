import BaseType from 'schemaType/BaseType';
import DisallowDirectError from 'Errors/DisallowDirect';

/**
 * A Complex Schema Type
 * @hideconstructor
 * @interface
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 */
class ComplexType extends BaseType {
	constructor() {
		if (new.target === ComplexType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'ComplexType' });
		}

		super();
	}
}

export default ComplexType;
