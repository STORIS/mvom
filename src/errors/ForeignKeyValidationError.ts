import type { GenericObject } from '../types';
import BaseError from './BaseError';

export interface ForeignKeyValidationErrorData {
	entityName: string;
	entityId: string;
}

interface ForeignKeyValidationErrorConstructorOptions {
	message?: string;
	foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
}

/** Error thrown when foreign key violations encountered when saving a document */
class ForeignKeyValidationError extends BaseError {
	/** Object containing details of validation errors */
	public readonly foreignKeyValidationErrors: GenericObject;

	public constructor({
		message = 'Foreign key violation(s) encountered while saving',
		foreignKeyValidationErrors,
	}: ForeignKeyValidationErrorConstructorOptions) {
		const name = 'ForeignKeyValidationError';
		super(message, name);

		this.foreignKeyValidationErrors = foreignKeyValidationErrors;
	}
}

export default ForeignKeyValidationError;
