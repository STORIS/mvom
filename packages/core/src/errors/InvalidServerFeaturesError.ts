import BaseError from './BaseError';

interface InvalidServerFeaturesErrorConstructorOptions {
	message?: string;
}

/** Error thrown when the db server has an invalid feature set */
class InvalidServerFeaturesError extends BaseError {
	public constructor({
		message = 'Invalid feature set on db server',
	}: InvalidServerFeaturesErrorConstructorOptions = {}) {
		const name = 'InvalidServerFeaturesError';
		super(message, name);
	}
}

export default InvalidServerFeaturesError;
