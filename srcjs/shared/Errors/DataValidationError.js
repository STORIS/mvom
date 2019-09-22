import BaseError from './BaseError';

/**
 * Error thrown when a data validation fails when saving a document
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Error(s) found while validating data'] - Error message
 * @param {Object} [options.validationErrors = {}] - Object containing details of validation errors
 * @param options.other All other properties will be passed to parent class constructor
 */
class DataValidationError extends BaseError {
	constructor({
		message = 'Error(s) found while validating data',
		validationErrors = {},
		...other
	} = {}) {
		const name = 'DataValidationError';
		super({ message, name, ...other });

		/**
		 * Object containing details of validation errors
		 * @member {string} validationErrors
		 * @memberof DataValidationError
		 * @instance
		 */
		this.validationErrors = validationErrors;
	}
}

export default DataValidationError;
