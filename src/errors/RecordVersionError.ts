import BaseError from './BaseError';

interface RecordVersionErrorConstructorOptions {
	message?: string;
	filename: string;
	recordId: string;
}

/** Error thrown when an error occurs due to a record having changed since it was read which prevented update */
class RecordVersionError extends BaseError {
	public readonly filename: string;

	public readonly recordId: string;

	public constructor({
		message = 'Record has changed since it was read and cannot be updated',
		filename,
		recordId,
	}: RecordVersionErrorConstructorOptions) {
		const name = 'RecordVersionError';
		super(message, name);

		this.filename = filename;
		this.recordId = recordId;
	}
}

export default RecordVersionError;
