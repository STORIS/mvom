import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
	invalidFeatures: string[];
}

/**
 * Error thrown when the db server has an invalid feature set
 */
class InvalidServerFeaturesError extends BaseError {
	/**
	 * List of the features that are invalid
	 */
	public readonly invalidFeatures: string[];

	public constructor({
		message = 'Invalid feature set on db server',
		invalidFeatures,
	}: ConstructorOptions) {
		const name = 'InvalidServerFeaturesError';
		super(message, name);

		this.invalidFeatures = invalidFeatures;
	}
}

export default InvalidServerFeaturesError;
