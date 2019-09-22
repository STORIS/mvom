import { DisallowDirectError } from '#shared/errors';
import BaseType from './BaseType';

/**
 * A Complex Schema Type
 * @extends BaseType
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
