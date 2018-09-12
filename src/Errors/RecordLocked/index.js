import BaseError from 'Errors/Base';

/**
 * Error thrown when an error occurs due to a record being locked which prevented update
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Record is locked and cannot be updated'] - Error message
 * @param options.other All other properties will be passed to parent class constructor
 */
class RecordLockedError extends BaseError {
	constructor({ message = 'Record is locked and cannot be updated', ...other } = {}) {
		const name = 'RecordLockedError';
		super({ message, name, ...other });
	}
}

export default RecordLockedError;
