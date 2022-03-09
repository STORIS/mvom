import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
	transformClass: string;
	transformValue: unknown;
}

/**
 * Error thrown when data cannot be transformed from multivalue format
 */
class TransformDataError extends BaseError {
	/**
	 * Class instance performing transformation
	 */
	public readonly transformClass: string;

	/**
	 * Original value that failed transformation
	 */
	public readonly transformValue: unknown;

	public constructor({
		message = 'Error transforming data from multivalue format',
		transformClass,
		transformValue,
	}: ConstructorOptions) {
		const name = 'TransformDataError';
		super(message, name);

		this.transformClass = transformClass;
		this.transformValue = transformValue;
	}
}

export default TransformDataError;
