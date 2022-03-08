import type { ForeignKeyValidationErrorData } from '../errors/ForeignKeyValidationError';
import type { DbActionSubroutineInputTypes } from './DbSubroutineInput';
import type { DbSubroutineResponseTypes } from './DbSubroutineOutput';

export interface DbActionInput<TAction extends string> {
	action: TAction;
}

/** Input to get a list of server features */
export type DbActionInputFeatureList = DbActionInput<'featureList'>;

/** Input to create a directory */
export interface DbActionInputCreateDir extends DbActionInput<'createDir'> {
	dirName: string;
}

/* Input to deploy source code */
export interface DbActionInputDeploy extends DbActionInput<'deploy'> {
	sourceDir: string;
	source: string;
	programName: string;
}

/** DB Feature Input Types */
export type DbActionInputTypes =
	| DbActionInputFeatureList
	| DbActionInputCreateDir
	| DbActionInputDeploy
	| DbActionSubroutineInputTypes;

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

export interface DbActionOutputFeatureList {
	features: string[];
}
export type DbActionResponseFeatureList = DbActionResponse<DbActionOutputFeatureList>;

export type DbActionResponseCreateDir = DbActionResponse<Record<string, never>>;

export interface DbActionOutputDeploy {
	deployed: string;
}
export type DbActionResponseDeploy = DbActionResponse<DbActionOutputDeploy>;

/** DB Feature Response Types */
export type DbFeatureResponseTypes =
	| DbActionResponseFeatureList
	| DbActionResponseCreateDir
	| DbActionResponseDeploy
	| DbSubroutineResponseTypes;
