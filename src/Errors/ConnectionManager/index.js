import BaseError from 'Errors/Base';

/**
 * Error thrown when an error occurs when communicating with the connection manager
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Error in Connection Manager communication'] - Error message
 * @param {Object} [options.request = {}] - Request object passed to connection manager
 * @param {Object} [options.response = {}] - Response object returned from connection manager (if any)
 * @param options.other All other properties will be passed to parent class constructor
 */
class ConnectionManagerError extends BaseError {
	constructor({
		message = 'Error in Connection Manager communication',
		request = {},
		response = {},
		...other
	} = {}) {
		const name = 'ConnectionManagerError';
		super({ message, name, ...other });

		/**
		 * Request object passed to connection manager
		 * @member {Object} request
		 * @memberof ConnectionManagerError
		 * @instance
		 */
		this.request = request;
		/**
		 * Response object returned from connection manager (if any)
		 * @member {Object} response
		 * @memberof ConnectionManagerError
		 * @instance
		 */
		this.response = response;
	}
}

export default ConnectionManagerError;
