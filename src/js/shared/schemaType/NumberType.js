import { InvalidParameterError, TransformDataError } from '#shared/errors';
import { handleTypeValidation } from '#shared/utils';
import SimpleType from './SimpleType';

/**
 * A Number Schema Type
 * @extends SimpleType
 * @param {Object} definition - Data definition
 * @param {string} definition.path - 1-indexed String path
 * @param {integer} [definition.dbDecimals = 0] - Number of implied decimals in database storage
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class NumberType extends SimpleType {
	constructor(definition) {
		if (definition.path == null) {
			throw new InvalidParameterError({ parameterName: 'definition.path' });
		}
		super(definition);
		const { dbDecimals = 0 } = definition;

		if (!Number.isInteger(dbDecimals)) {
			throw new InvalidParameterError({ parameterName: 'definition.dbDecimals' });
		}

		/**
		 * Number of implied decimals in database storage
		 * @member {Number} _dbDecimals
		 * @memberof NumberType
		 * @instance
		 * @private
		 */
		this._dbDecimals = dbDecimals;

		// add validators for this type
		this._validators.unshift(handleTypeValidation(this._validateType));
	}

	/* public instance methods */

	/**
	 * Transform mv style internally formatted numeric data (nnnnn) to externally formatted numeric data (nnn.nn)
	 * @function transformFromDb
	 * @memberof NumberType
	 * @instance
	 * @public
	 * @override
	 * @param {string|number|null} value - Value to transform
	 * @returns {Number|null} Transformed numeric value
	 * @throws {TransformDataError} Database value could not be transformed to external format
	 */
	transformFromDb = (value) => {
		if (value == null) {
			return null;
		}
		const castValue = +value;
		if (!Number.isFinite(castValue)) {
			throw new TransformDataError({
				transformClass: this.constructor.name,
				transformValue: castValue,
			});
		}

		return +(Math.round(castValue, 0) / 10 ** this._dbDecimals).toFixed(this._dbDecimals);
	};

	/**
	 * Transform externally formatted numeric data (nnn.nn) to mv style internally formatted numeric data
	 * @function transformToDb
	 * @memberof NumberType
	 * @instance
	 * @public
	 * @override
	 * @param {number|null} value - Value to transform
	 * @returns {string|null} Transformed string integer representing internal multivalue number format
	 */
	transformToDb = (value) => (value == null ? null : (+value * 10 ** this._dbDecimals).toFixed(0));

	/* private instance methods */

	/**
	 * NumberType data type validator
	 * @function _validateType
	 * @memberof NumberType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Value to validate for data type casting
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateType = async (value) => value == null || Number.isFinite(+value);
}

export default NumberType;
