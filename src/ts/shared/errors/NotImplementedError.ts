import BaseError from './BaseError';

interface ConstructorOptions {
	message?: string;
}

/**
 * Error thrown when an interface method is called directly
 */
class NotImplementedError extends BaseError {
	public constructor({ message = 'Interface method not implemented' }: ConstructorOptions = {}) {
		const name = 'NotImplementedError';
		super(message, name);
	}
}

export default NotImplementedError;
