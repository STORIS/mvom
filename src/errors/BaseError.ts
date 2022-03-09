/**
 * Base error class for this module - all other errors should inherit from it
 */
class BaseError extends Error {
	/**
	 * Source of the error - always "mvom"
	 */
	public readonly source = 'mvom';

	protected constructor(message: string, name: string) {
		super(message);

		this.name = name;
	}
}

export default BaseError;
