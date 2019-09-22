import { DisallowDirectError, InvalidParameterError, NotImplementedError } from '#sharedjs/Errors';
import ComplexType from './ComplexType';
import SimpleType from './SimpleType';

/**
 * A Base Type for all primitive arrays
 * @extends ComplexType
 * @hideconstructor
 * @param {SimpleType} valueSchemaType - A schemaType representing the type of the array's contents
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
 */
class BasePrimitiveArrayType extends ComplexType {
	constructor(valueSchemaType) {
		if (new.target === BasePrimitiveArrayType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'BaseArrayType' });
		}

		if (!(valueSchemaType instanceof SimpleType)) {
			// array values must be a child of SimpleType class
			throw new InvalidParameterError({ parameterName: 'valueSchemaType' });
		}

		super();

		const { required = false } = valueSchemaType.definition;

		/**
		 * A schemaType representing the type of the array's contents
		 * @member {SimpleType} _valueSchemaType
		 * @memberof ArrayType
		 * @instance
		 * @private
		 */
		this._valueSchemaType = valueSchemaType;
		/**
		 * Required validation value for the array
		 * @member {Boolean|Function} _required
		 * @memberof ArrayType
		 * @instance
		 * @private
		 */
		this._required = required;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof BasePrimitiveArrayType
	 * @abstract
	 * @instance
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	get = () => {
		throw new NotImplementedError({
			methodName: 'get',
			className: this.constructor.name,
		});
	};

	/**
	 * Set specified array value into mv record
	 * @function set
	 * @memberof BasePrimitiveArrayType
	 * @abstract
	 * @instance
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	set = () => {
		throw new NotImplementedError({
			methodName: 'set',
			className: this.constructor.name,
		});
	};

	/**
	 * Transform query constants to the format defined by the array's schema
	 * @function transformToQuery
	 * @memberof BasePrimitiveArrayType
	 * @instance
	 * @public
	 * @param {string} value - Value to convert
	 * @returns {string} U2 Internally formatted data
	 */
	transformToQuery = value => this._valueSchemaType.transformToQuery(value);

	/**
	 * Validate the array
	 * @function validate
	 * @memberof BasePrimitiveArrayType
	 * @abstract
	 * @instance
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	validate = () => {
		throw new NotImplementedError({
			methodName: 'validate',
			className: this.constructor.name,
		});
	};

	/* private instance methods */

	/**
	 * Array required validator
	 * @function _validateRequired
	 * @memberof BasePrimitiveArrayType
	 * @instance
	 * @private
	 * @async
	 * @param {*[]} value - Array to validate
	 * @returns {Promise.<Boolean>} True if valid / false if invalid
	 */
	_validateRequired = async value => value.length > 0;
}

export default BasePrimitiveArrayType;
