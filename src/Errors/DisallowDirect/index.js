/**
 * Error thrown when direct instantiation of a parent class is disallowed
 * @extends Error
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'This class cannot be instantiated directly'] - Error message
 * @param {string} [options.className = 'Unknown'] - Name of the class that was being instantiated
 * @param options.other All other properties will be destructured to instance property named "other"
 */
class DisallowDirectError extends Error {
	// this error class is a special case that does not extend the base error class --
	// the Base error class will throw this error when it is instantiated directly and if this module
	// were to extend the base error class then a circular dependency of module imports occurs;
	constructor({
		message = 'This class cannot be instantiated directly',
		className = 'Unknown',
		...other
	} = {}) {
		super(message);

		/**
		 * Name of the error - used for identification purposes
		 * @member {string} name
		 * @memberof BaseError
		 * @instance
		 */
		this.name = 'DisallowDirectError';
		/**
		 * Name of the class that was being instantiated
		 * @member {string} className
		 * @memberof DisallowDirectError
		 * @instance
		 */
		this.className = className;
		/**
		 * Other properties passed to constructor
		 * @member {Object} other
		 * @memberof BaseError
		 * @instance
		 */
		this.other = other;
	}
}

export default DisallowDirectError;
