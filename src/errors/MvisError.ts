import BaseError from './BaseError';

interface MvisErrorConstructorOptions {
	message?: string;
	connectionManagerRequest?: unknown;
	connectionManagerResponse?: unknown;
}

/** Error thrown when an error occurs when communicating with the connection manager */
class MvisError extends BaseError {
	/** Request object passed to connection manager */
	public readonly connectionManagerRequest: unknown;

	/** Response object returned from connection manager (if any) */
	public readonly connectionManagerResponse: unknown;

	public constructor({
		message = 'Error in MVIS communication',
		connectionManagerRequest = {},
		connectionManagerResponse = {},
	}: MvisErrorConstructorOptions = {}) {
		const name = 'MvisError';
		super(message, name);

		this.connectionManagerRequest = connectionManagerRequest;
		this.connectionManagerResponse = connectionManagerResponse;
	}
}

export default MvisError;
