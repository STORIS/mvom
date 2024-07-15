import type { AxiosError } from 'axios';
import BaseError from './BaseError';

interface MvisErrorConstructorOptions {
	message?: string;
}

/** Error thrown when an error occurs when communicating with the connection manager */
class MvisError extends BaseError {
	public constructor(
		cause: AxiosError,
		{ message = 'Error in MVIS communication' }: MvisErrorConstructorOptions = {},
	) {
		const name = 'MvisError';
		super(message, name);

		this.cause = cause;
	}
}

export default MvisError;
