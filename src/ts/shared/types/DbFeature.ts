/* eslint-disable */
// TODO REMOVE THE ABOVE
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DbActionInputSubroutine<TSubroutineOptions extends Record<string, any>> {
	action: 'subroutine';
	subroutineId: string;
	setupId: string;
	setupOptions: Record<string, any>;
	teardownId: string;
	teardownOptions: Record<string, any>;
	options: TSubroutineOptions;
}

export interface DbSubroutineOptionsDeleteById {
	filename: string;
	id: string;
}
export type DbSubroutineInputDeleteById = DbActionInputSubroutine<DbSubroutineOptionsDeleteById>;

/** DB Feature Input Types */
export type DbActionInputTypes =
	| DbActionInputFeatureList
	| DbActionInputCreateDir
	| DbActionInputDeploy
	| DbActionInputSubroutine<any>;

interface DbActionResponse<TOutput> {
	output: TOutput;
}

export interface DbActionOutputError {
	errorCode: string;
}
export type DbActionResponseError = DbActionResponse<DbActionOutputError>;

export interface DbActionOutputFeatureList {
	featureList: string[];
}
export type DbActionResponseFeatureList =
	| DbActionResponse<DbActionOutputFeatureList>
	| DbActionResponseError;

export type DbActionResponseCreateDir =
	| DbActionResponse<Record<string, never>>
	| DbActionResponseError;

export interface DbActionOutputDeploy {
	deployed: string;
}
export type DbActionResponseDeploy = DbActionResponse<DbActionOutputDeploy> | DbActionResponseError;

/** DB Feature Response Types */
export type DbFeatureResponseTypes =
	| DbActionResponseFeatureList
	| DbActionResponseCreateDir
	| DbActionResponseDeploy;
