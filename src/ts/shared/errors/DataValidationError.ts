import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
	validationErrors: Mvom.GenericObject;
}

/**
 * Error thrown when a data validation fails when saving a document
 */
class DataValidationError extends BaseError {
	/**
	 * Object containing details of validation errors
	 */
	public readonly validationErrors: Mvom.GenericObject;

	public constructor({
		message = 'Error(s) found while validating data',
		validationErrors,
	}: ConstructorOptions) {
		const name = 'DataValidationError';
		super(message, name);

		this.validationErrors = validationErrors;
	}
}

export default DataValidationError;
