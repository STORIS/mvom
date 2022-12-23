import BaseError from './BaseError';

interface RecordVersionErrorConstructorOptions {
	message?: string;
	filename: string;
	recordId: string;
	comoLogId?: string | null;
}

/** Error thrown when an error occurs due to a record having changed since it was read which prevented update */
class RecordVersionError extends BaseError {
	public readonly filename: string;

	public readonly recordId: string;

	public readonly comoLogId: string | null;

	public constructor({
		message = 'Record has changed since it was read and cannot be updated',
		filename,
		recordId,
		comoLogId,
	}: RecordVersionErrorConstructorOptions) {
		const name = 'RecordVersionError';
		super(message, name);

		this.filename = filename;
		this.recordId = recordId;
		this.comoLogId = comoLogId ?? null;
	}
}

export default RecordVersionError;
