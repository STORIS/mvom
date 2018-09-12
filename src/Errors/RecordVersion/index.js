import BaseError from 'Errors/Base';

/**
 * Error thrown when an error occurs due to a record having changed since it was read which prevented update
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Record has changed since it was read and cannot be updated'] - Error message
 * @param options.other All other properties will be passed to parent class constructor
 */
class RecordVersionError extends BaseError {
	constructor({
		message = 'Record has changed since it was read and cannot be updated',
		...other
	} = {}) {
		const name = 'RecordVersionError';
		super({ message, name, ...other });
	}
}

export default RecordVersionError;
