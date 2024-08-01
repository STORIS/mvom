import BaseError from './BaseError';

interface RecordNotFoundErrorConstructorOptions {
	message?: string;
	filename: string;
	recordId: string;
}

/** Error thrown when an error occurs due to a record not being found */
class RecordNotFoundError extends BaseError {
	public readonly filename: string;

	public readonly recordId: string;

	public constructor({
		message = 'Database record not found',
		filename,
		recordId,
	}: RecordNotFoundErrorConstructorOptions) {
		const name = 'RecordNotFoundError';
		super(message, name);
		this.filename = filename;
		this.recordId = recordId;
	}
}

export default RecordNotFoundError;
