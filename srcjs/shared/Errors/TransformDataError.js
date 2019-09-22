import BaseError from './BaseError';

/**
 * Error thrown when data cannot be transformed from multivalue format
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Error transforming data from multivalue format'] - Error message
 * @param {string} [options.transformClass = 'Unknown'] - Class instance performing transformation
 * @param {*} [options.transformValue = 'Unknown'] - Original value that failed transformation
 * @param options.other All other properties will be passed to parent class constructor
 */
class TransformDataError extends BaseError {
	constructor({
		message = 'Error transforming data from multivalue format',
		transformClass = 'Unknown',
		transformValue = 'Unknown',
		...other
	} = {}) {
		const name = 'TransformDataError';
		super({ message, name, ...other });
		/**
		 * Class instance performing transformation
		 * @member transformClass
		 * @memberof TransformDataError
		 * @instance
		 */
		this.transformClass = transformClass;
		/**
		 * Original value that failed transformation
		 * @member transformValue
		 * @memberof TransformDataError
		 * @instance
		 */
		this.transformValue = transformValue;
	}
}

export default TransformDataError;
