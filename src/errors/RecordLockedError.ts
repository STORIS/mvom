import BaseError from './BaseError';

interface RecordLockedErrorConstructorOptions {
	message?: string;
	filename: string;
	recordId: string;
}

/** Error thrown when an error occurs due to a record being locked which prevented update */
class RecordLockedError extends BaseError {
	public readonly filename: string;

	public readonly recordId: string;

	public constructor({
		message = 'Record is locked and cannot be updated',
		filename,
		recordId,
	}: RecordLockedErrorConstructorOptions) {
		const name = 'RecordLockedError';
		super(message, name);

		this.filename = filename;
		this.recordId = recordId;
	}
}

export default RecordLockedError;
