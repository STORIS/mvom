import BaseError from 'Errors/Base';

/**
 * Error thrown when an interface method is called directly
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Interface method not implemented'] - Error message
 * @param {string} [options.methodName = 'Unknown'] - Name of the interface method that was called
 * @param {string} [options.className = 'Unknown'] - Name of the constructor that failed to implement the interface method
 * @param options.other All other properties will be passed to parent class constructor
 */
class NotImplementedError extends BaseError {
	constructor({
		message = 'Interface method not implemented',
		methodName = 'Unknown',
		className = 'Unknown',
		...other
	} = {}) {
		const name = 'NotImplementedError';
		super({ message, name, ...other });

		/**
		 * Name of the interface method that was called
		 * @member {string} methodName
		 * @memberof NotImplementedError
		 * @instance
		 */
		this.methodName = methodName;
		/**
		 * Name of the constructor that failed to implement the interface method
		 * @member {string} className
		 * @memberof NotImplementedError
		 * @instance
		 */
		this.className = className;
	}
}

export default NotImplementedError;
