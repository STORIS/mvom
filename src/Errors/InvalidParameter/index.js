import BaseError from 'Errors/Base';

/**
 * Error thrown when a function is passed an invalid parameter
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Invalid parameter passed to function'] - Error message
 * @param {string} [options.parameterName = 'Unknown'] - Name of the parameter that was invalid
 * @param options.other All other properties will be passed to parent class constructor
 */
class InvalidParameterError extends BaseError {
	constructor({
		message = 'Invalid parameter passed to function',
		parameterName = 'Unknown',
		...other
	} = {}) {
		const name = 'InvalidParameterError';
		super({ message, name, ...other });

		/**
		 * Name of the parameter that was invalid
		 * @member {string} parameterName
		 * @memberof InvalidParameterError
		 * @instance
		 */
		this.parameterName = parameterName;
	}
}

export default InvalidParameterError;
