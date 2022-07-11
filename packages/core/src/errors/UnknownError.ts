import BaseError from './BaseError';

// #region Types
interface UnknownErrorConstructorOptions {
	message?: string;
}
// #endregion

class UnknownError extends BaseError {
	public constructor({
		message = 'An unknown error has occurred',
	}: UnknownErrorConstructorOptions = {}) {
		const name = 'UnknownError';
		super(message, name);
	}
}

export default UnknownError;
