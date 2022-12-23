import { dbErrors } from '../constants';
import BaseError from './BaseError';

interface DbServerErrorConstructorOptionsBase {
	comoLogId?: string | null;
}

interface DbServerErrorConstructorOptionsMessage extends DbServerErrorConstructorOptionsBase {
	message: string;
}

interface DbServerErrorConstructorOptionsCode extends DbServerErrorConstructorOptionsBase {
	errorCode: number | string;
}

type DbServerErrorConstructorOptions =
	| DbServerErrorConstructorOptionsMessage
	| DbServerErrorConstructorOptionsCode;

/** Error thrown when an error is encountered on the database server */
class DbServerError extends BaseError {
	public readonly comoLogId: string | null;

	public constructor(options: DbServerErrorConstructorOptions) {
		const name = 'DbServerError';

		const message =
			'message' in options
				? options.message
				: Object.values(dbErrors).find((errorObj) => errorObj.code === +options.errorCode)
						?.message ?? 'Unknown database server error';

		super(message, name);

		this.comoLogId = options.comoLogId ?? null;
	}
}

export default DbServerError;
