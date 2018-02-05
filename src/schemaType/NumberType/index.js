import isNumber from 'lodash/isNumber';
import SimpleType from 'schemaType/SimpleType';

/**
 * A Number Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {integer} [definition.dbDecimals = 0] - Number of implied decimals in database storage
 * @throws {Error}
 */
class NumberType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new Error();
		}
		super(definition);
		const { dbDecimals = 0 } = definition;

		if (!Number.isInteger(dbDecimals)) {
			throw new Error();
		}

		/**
		 * Number of implied decimals in database storage
		 * @member {Number} _dbDecimals
		 * @memberof NumberType
		 * @instance
		 * @private
		 */
		this._dbDecimals = dbDecimals;
	}

	/* public instance methods */

	/**
	 * Transform mv style internally formatted numeric data (nnnnn) to externally formatted numeric data (nnn.nn)
	 * @function transformFromDb
	 * @memberof NumberType
	 * @instance
	 * @public
	 * @override
	 * @param {integer} value - Value to transform
	 * @returns {Number} Transformed numeric value
	 * @throws {Error}
	 */
	transformFromDb = value => {
		if (!isNumber(value)) {
			throw new Error();
		}

		return +(Math.round(value, 0) / 10 ** this._dbDecimals).toFixed(this._dbDecimals);
	};
}

export default NumberType;
