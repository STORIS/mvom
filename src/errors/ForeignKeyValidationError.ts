import BaseError from './BaseError';

export interface ForeignKeyValidationErrorData {
	entityName: string;
	entityId: string;
}

interface ForeignKeyValidationErrorConstructorOptions {
	message?: string;
	foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
	filename: string;
	recordId: string;
}

/** Error thrown when foreign key violations encountered when saving a document */
class ForeignKeyValidationError extends BaseError {
	/** Object containing details of validation errors */
	public readonly foreignKeyValidationErrors: ForeignKeyValidationErrorData[];

	public readonly filename: string;

	public readonly recordId: string;

	public constructor({
		message = 'Foreign key violation(s) encountered while saving',
		foreignKeyValidationErrors,
		filename,
		recordId,
	}: ForeignKeyValidationErrorConstructorOptions) {
		const name = 'ForeignKeyValidationError';
		super(message, name);

		this.foreignKeyValidationErrors = foreignKeyValidationErrors;
		this.filename = filename;
		this.recordId = recordId;
	}
}

export default ForeignKeyValidationError;
