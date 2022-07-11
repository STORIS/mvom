import BaseError from './BaseError';

interface DataValidationErrorConstructorOptions {
	message?: string;
	validationErrors: Map<string, string | string[]>;
}

/** Error thrown when a data validation fails when saving a document */
class DataValidationError extends BaseError {
	/** Object containing details of validation errors */
	public readonly validationErrors: Record<string, string | string[]>;

	public constructor({
		message = 'Error(s) found while validating data',
		validationErrors,
	}: DataValidationErrorConstructorOptions) {
		const name = 'DataValidationError';
		super(message, name);

		this.validationErrors = Object.fromEntries(validationErrors);
	}
}

export default DataValidationError;
