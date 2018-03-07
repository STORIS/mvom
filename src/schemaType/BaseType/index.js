import DisallowDirectError from 'Errors/DisallowDirect';
import NotImplementedError from 'Errors/NotImplemented';

/**
 * A Base Schema Type
 * @hideconstructor
 * @interface
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 */
class BaseType {
	constructor() {
		if (new.target === BaseType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'BaseType' });
		}

		/**
		 * List of validation functions to run for this schema type
		 * @member {ValidationObject[]} _validators
		 * @memberof BaseType
		 * @instance
		 * @private
		 */
		this._validators = [];
	}

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Formatted data value
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	get = () => {
		throw new NotImplementedError({ methodName: 'get', className: this.constructor.name });
	};
	/**
	 * Set value into mv data
	 * @function set
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to set into record
	 * @returns {*[]} Array data of output record format
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	set = () => {
		throw new NotImplementedError({ methodName: 'set', className: this.constructor.name });
	};
	/**
	 * Validate value
	 * @function validate
	 * @memberof BaseType
	 * @abstract
	 * @instance
	 * @async
	 * @param {*} value - Value to verify
	 * @param {Object} document - Document instance
	 * @throws {NotImplementedError} Thrown if called directly
	 */
	validate = async () => {
		throw new NotImplementedError({ methodName: 'validate', className: this.constructor.name });
	};
}

export default BaseType;
