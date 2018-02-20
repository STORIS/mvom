/**
 * A Base Schema Type
 * @hideconstructor
 * @interface
 * @throws {Error}
 */
class BaseType {
	constructor() {
		if (new.target === BaseType) {
			// disallow direct instantiation
			throw new Error();
		}
	}

	/* public instance methods */

	/**
	 * Transform mv style data to js style data
	 * @function transformFromDb
	 * @memberof BaseType
	 * @instance
	 * @public
	 * @param {*} value - Value to transform
	 * @returns {*} Transformed value
	 */
	transformFromDb = value => value;

	/**
	 * Transform js style data to mv style data
	 * @function transformToDb
	 * @memberof BaseType
	 * @instance
	 * @public
	 * @param {*} value - Value to transform
	 * @returns {*} Transformed value
	 */
	transformToDb = value => value;
}

export default BaseType;
