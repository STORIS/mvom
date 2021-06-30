import { dbErrors } from '#shared/constants';
import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
	errorCode: number | string;
}

/**
 * Error thrown when an error is encountered on the database server
 */
class DbServerError extends BaseError {
	public constructor({ message: overrideMessage, errorCode }: ConstructorOptions) {
		const name = 'DbServerError';

		let message = 'Unknown database server error';
		if (overrideMessage != null) {
			message = overrideMessage;
		} else {
			const foundError = Object.values(dbErrors).find((errorObj) => errorObj.code === +errorCode);
			if (foundError != null) {
				({ message } = foundError);
			}
		}
		super(message, name);
	}
}

export default DbServerError;
