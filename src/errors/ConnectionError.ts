import BaseError from './BaseError';

interface ConnectionErrorConstructorOptions {
	message?: string;
}

/** Error thrown when an error occurs when attempting to connect to the db server */
class ConnectionError extends BaseError {
	public constructor({
		message = 'Error connecting to DB Server',
	}: ConnectionErrorConstructorOptions = {}) {
		const name = 'ConnectionError';
		super(message, name);
	}
}

export default ConnectionError;
