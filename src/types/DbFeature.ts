import type { ForeignKeyValidationErrorData } from '../errors/ForeignKeyValidationError';

export interface DbActionResponse<TOutput> {
	output: TOutput;
}

export interface DbActionOutputErrorBase {
	errorCode: string;
}
export interface DbActionOutputErrorForeignKey extends DbActionOutputErrorBase {
	errorCode: '14';
	foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
}
export type DbActionResponseError = DbActionResponse<
	DbActionOutputErrorBase | DbActionOutputErrorForeignKey
>;
