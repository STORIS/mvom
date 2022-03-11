import BaseError from './BaseError';

interface MvisErrorConstructorOptions {
	message?: string;
	mvisRequest?: unknown;
	mvisResponse?: unknown;
}

/** Error thrown when an error occurs when communicating with the connection manager */
class MvisError extends BaseError {
	/** Request object passed to connection manager */
	public readonly mvisRequest: unknown;

	/** Response object returned from connection manager (if any) */
	public readonly mvisResponse: unknown;

	public constructor({
		message = 'Error in MVIS communication',
		mvisRequest = {},
		mvisResponse = {},
	}: MvisErrorConstructorOptions = {}) {
		const name = 'MvisError';
		super(message, name);

		this.mvisRequest = mvisRequest;
		this.mvisResponse = mvisResponse;
	}
}

export default MvisError;
