import BaseError from 'Errors/Base';

/**
 * Error thrown when the db server has an invalid feature set
 * @extends BaseError
 * @param {Object} [options = {}]
 * @param {string} [options.message = 'Invalid feature set on db server'] - Error message
 * @param {string} [options.invalidFeatures = []] - List of the features that are invalid
 * @param options.other All other properties will be passed to parent class constructor
 */
class InvalidServerFeaturesError extends BaseError {
	constructor({
		message = 'Invalid feature set on db server',
		invalidFeatures = [],
		...other
	} = {}) {
		const name = 'InvalidServerFeaturesError';
		super({ message, name, ...other });

		/**
		 * List of the features that are invalid
		 * @member {string[]} invalidFeatures
		 * @memberof InvalidServerFeaturesError
		 * @instance
		 */
		this.invalidFeatures = invalidFeatures;
	}
}

export default InvalidServerFeaturesError;
