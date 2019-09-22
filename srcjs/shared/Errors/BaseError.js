import DisallowDirectError from './DisallowDirectError';

/**
 * Base error class for this module - cannot be instantiated directly and all other errors should inherit from it
 * @extends Error
 * @hideconstructor
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Base Error'] - Error message
 * @param {string} [options.name = 'BaseError'] - Name of the error - used for identification purposes
 * @param options.other All other properties will be destructured to instance property named "other"
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 */
class BaseError extends Error {
	constructor({ message = 'Base Error', name = 'BaseError', ...other } = {}) {
		if (new.target === BaseError) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'BaseError' });
		}

		super(message);
		/**
		 * Source of the error - always "mvom"
		 * @member {string} source
		 * @memberof BaseError
		 * @instance
		 */
		this.source = 'mvom';
		/**
		 * Name of the error - used for identification purposes
		 * @member {string} name
		 * @memberof BaseError
		 * @instance
		 */
		this.name = name;
		/**
		 * Other properties passed to constructor
		 * @member {Object} other
		 * @memberof BaseError
		 * @instance
		 */
		this.other = other;
	}
}

export default BaseError;
