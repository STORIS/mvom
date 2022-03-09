import type { GenericObject } from '../types';
import BaseError from './BaseError';

interface DataValidationErrorConstructorOptions {
	message?: string;
	validationErrors: GenericObject;
}

/** Error thrown when a data validation fails when saving a document */
class DataValidationError extends BaseError {
	/** Object containing details of validation errors */
	public readonly validationErrors: GenericObject;

	public constructor({
		message = 'Error(s) found while validating data',
		validationErrors,
	}: DataValidationErrorConstructorOptions) {
		const name = 'DataValidationError';
		super(message, name);

		this.validationErrors = validationErrors;
	}
}

export default DataValidationError;
