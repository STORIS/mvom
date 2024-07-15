import BaseError from './BaseError';

// #region Types
interface UnknownErrorConstructorOptions {
	message?: string;
}
// #endregion

class UnknownError extends BaseError {
	public constructor(
		cause: unknown,
		{ message = 'An unknown error has occurred' }: UnknownErrorConstructorOptions = {},
	) {
		const name = 'UnknownError';
		super(message, name);

		this.cause = cause;
	}
}

export default UnknownError;
