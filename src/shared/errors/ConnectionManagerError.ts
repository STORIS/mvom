import type { GenericObject } from '../types';
import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
	connectionManagerRequest?: GenericObject;
	connectionManagerResponse?: GenericObject;
}

/**
 * Error thrown when an error occurs when communicating with the connection manager
 */
class ConnectionManagerError extends BaseError {
	/**
	 * Request object passed to connection manager
	 */
	public readonly connectionManagerRequest: GenericObject;

	/**
	 * Response object returned from connection manager (if any)
	 */
	public readonly connectionManagerResponse: GenericObject;

	public constructor({
		message = 'Error in Connection Manager communication',
		connectionManagerRequest = {},
		connectionManagerResponse = {},
	}: ConstructorOptions = {}) {
		const name = 'ConnectionManagerError';
		super(message, name);

		this.connectionManagerRequest = connectionManagerRequest;
		this.connectionManagerResponse = connectionManagerResponse;
	}
}

export default ConnectionManagerError;
