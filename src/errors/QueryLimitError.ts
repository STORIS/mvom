import BaseError from './BaseError';

interface QueryLimitErrorOptions {
	message?: string;
}

class QueryLimitError extends BaseError {
	public constructor({ message = 'Query exceeds database server limits' }: QueryLimitErrorOptions) {
		const name = 'QueryLimitError';
		super(message, name);
	}
}

export default QueryLimitError;
