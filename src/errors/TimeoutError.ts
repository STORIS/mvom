import BaseError from './BaseError';

// #region Types
interface TimeoutErrorConstructorOptions {
	message?: string;
}
// #endregion

class TimeoutError extends BaseError {
	public constructor({
		message = 'The request to the DB server timed out',
	}: TimeoutErrorConstructorOptions = {}) {
		const name = 'TimeoutError';
		super(message, name);
	}
}

export default TimeoutError;
