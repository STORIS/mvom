import BaseError from './BaseError';

interface InvalidParameterErrorConstructorOptions {
	message?: string;
	parameterName: string;
}

/** Error thrown when a function is passed an invalid parameter */
class InvalidParameterError extends BaseError {
	/** Name of the parameter that was invalid */
	public readonly parameterName: string;

	public constructor({
		message = 'Invalid parameter passed to function',
		parameterName,
	}: InvalidParameterErrorConstructorOptions) {
		const name = 'InvalidParameterError';
		super(message, name);

		this.parameterName = parameterName;
	}
}

export default InvalidParameterError;
