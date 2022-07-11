import BaseError from './BaseError';

interface RecordLockedErrorConstructorOptions {
	message?: string;
}

/** Error thrown when an error occurs due to a record being locked which prevented update */
class RecordLockedError extends BaseError {
	public constructor({
		message = 'Record is locked and cannot be updated',
	}: RecordLockedErrorConstructorOptions = {}) {
		const name = 'RecordLockedError';
		super(message, name);
	}
}

export default RecordLockedError;
