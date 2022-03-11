import BaseError from './BaseError';

interface RecordVersionErrorConstructorOptions {
	message?: string;
}

/** Error thrown when an error occurs due to a record having changed since it was read which prevented update */
class RecordVersionError extends BaseError {
	public constructor({
		message = 'Record has changed since it was read and cannot be updated',
	}: RecordVersionErrorConstructorOptions = {}) {
		const name = 'RecordVersionError';
		super(message, name);
	}
}

export default RecordVersionError;
