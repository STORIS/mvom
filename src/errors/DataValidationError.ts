import BaseError from './BaseError';

interface DataValidationErrorConstructorOptions {
	message?: string;
	validationErrors: Map<string, string | string[]>;
	filename: string;
	recordId: string;
}

/** Error thrown when a data validation fails when saving a document */
class DataValidationError extends BaseError {
	/** Object containing details of validation errors */
	public readonly validationErrors: Record<string, string | string[]>;

	public readonly filename: string;

	public readonly recordId: string;

	public constructor({
		message = 'Error(s) found while validating data',
		validationErrors,
		filename,
		recordId,
	}: DataValidationErrorConstructorOptions) {
		const name = 'DataValidationError';
		super(message, name);

		this.validationErrors = Object.fromEntries(validationErrors);
		this.filename = filename;
		this.recordId = recordId;
	}
}

export default DataValidationError;
