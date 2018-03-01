import BaseError from 'Errors/Base';
import dbErrors from 'shared/dbErrors';

/**
 * Error thrown when an error is encountered on the database server
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Unknown database server error'] - Error message
 * @param {Object} [options.errorCode]
 * @param options.other All other properties will be passed to parent class constructor
 */
class DbServerError extends BaseError {
	constructor({ message: overrideMessage, errorCode, ...other } = {}) {
		const name = 'DbServerError';

		let message = 'Unknown database server error';
		if (overrideMessage != null) {
			message = overrideMessage;
		} else {
			const foundError = Object.values(dbErrors).find(errorObj => errorObj.code === +errorCode);
			if (foundError != null) {
				({ message } = foundError);
			}
		}
		super({ message, name, ...other });
	}
}

export default DbServerError;
