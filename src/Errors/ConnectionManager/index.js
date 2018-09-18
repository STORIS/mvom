import BaseError from 'Errors/Base';

/**
 * Error thrown when an error occurs when communicating with the connection manager
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Error in Connection Manager communication'] - Error message
 * @param {Object} [options.connectionManagerRequest = {}] - Request object passed to connection manager
 * @param {Object} [options.connectionManagerResponse = {}] - Response object returned from connection manager (if any)
 * @param options.other All other properties will be passed to parent class constructor
 */
class ConnectionManagerError extends BaseError {
	constructor({
		message = 'Error in Connection Manager communication',
		connectionManagerRequest = {},
		connectionManagerResponse = {},
		...other
	} = {}) {
		const name = 'ConnectionManagerError';
		super({ message, name, ...other });

		/**
		 * Request object passed to connection manager
		 * @member {Object} connectionManagerRequest
		 * @memberof ConnectionManagerError
		 * @instance
		 */
		this.connectionManagerRequest = connectionManagerRequest;
		/**
		 * Response object returned from connection manager (if any)
		 * @member {Object} connectionManagerResponse
		 * @memberof ConnectionManagerError
		 * @instance
		 */
		this.connectionManagerResponse = connectionManagerResponse;
	}
}

export default ConnectionManagerError;
