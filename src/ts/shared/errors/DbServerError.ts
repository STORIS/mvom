import { dbErrors } from '#shared/constants';
import BaseError from './BaseError';

interface DbServerErrorConstructorOptionsMessage {
	message: string;
}

interface DbServerErrorConstructorOptionsCode {
	errorCode: number | string;
}

type DbServerErrorConstructorOptions =
	| DbServerErrorConstructorOptionsMessage
	| DbServerErrorConstructorOptionsCode;

/**
 * Error thrown when an error is encountered on the database server
 */
class DbServerError extends BaseError {
	public constructor(options: DbServerErrorConstructorOptions) {
		const name = 'DbServerError';

		const message =
			'message' in options
				? options.message
				: Object.values(dbErrors).find((errorObj) => errorObj.code === +options.errorCode)
						?.message ?? 'Unknown database server error';

		super(message, name);
	}
}

export default DbServerError;
