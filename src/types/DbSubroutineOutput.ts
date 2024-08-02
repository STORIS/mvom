import type { ForeignKeyValidationErrorData } from '../errors/ForeignKeyValidationError';

export interface DbDocument {
	_id: string;
	__v: string | null;
	record: string;
}

export interface DbSubroutineResponse<TOutput> {
	output: TOutput;
}

export interface DbSubroutineOutputDeleteById {
	result: DbDocument | null;
}
export type DbSubroutineResponseDeleteById = DbSubroutineResponse<DbSubroutineOutputDeleteById>;

export interface DbSubroutineOutputFind {
	count: number;
	documents: DbDocument[];
}
export type DbSubroutineResponseFind = DbSubroutineResponse<DbSubroutineOutputFind>;

export interface DbSubroutineOutputFindById {
	result: DbDocument | null;
}
export type DbSubroutineResponseFindById = DbSubroutineResponse<DbSubroutineOutputFindById>;

export interface DbSubroutineOutputFindByIds {
	result: (DbDocument | null)[];
}
export type DbSubroutineResponseFindByIds = DbSubroutineResponse<DbSubroutineOutputFindByIds>;

export interface DbSubroutineOutputIncrement {
	result: DbDocument | null;
}
export type DbSubroutineResponseIncrement = DbSubroutineResponse<DbSubroutineOutputIncrement>;

export interface DbSubroutineOutputReadFileContentsById {
	result: string;
}
export type DbSubroutineResponseReadFileContentsById =
	DbSubroutineResponse<DbSubroutineOutputReadFileContentsById>;

/** Characters which delimit strings on multivalue database server */
export interface DbServerDelimiters {
	/** Record mark */
	rm: string;
	/** Attribute mark */
	am: string;
	/** Value mark */
	vm: string;
	/** Subvalue mark */
	svm: string;
}
/** Multivalue database server limits */
export interface DbServerLimits {
	/** Maximum number of sort criteria in a query */
	maxSort: number;
	/** Maximum number of conditions in a query */
	maxWith: number;
	/** Maximum length of a query */
	maxSentenceLength: number;
}
export interface DbSubroutineOutputGetServerInfo {
	date: number;
	time: number;
	delimiters: DbServerDelimiters;
	limits: DbServerLimits;
}
export type DbSubroutineResponseGetServerInfo =
	DbSubroutineResponse<DbSubroutineOutputGetServerInfo>;

export interface DbSubroutineOutputSave {
	result: DbDocument;
}
export type DbSubroutineResponseSave = DbSubroutineResponse<DbSubroutineOutputSave>;

export type DbSubroutineResponseTypes =
	| DbSubroutineResponseDeleteById
	| DbSubroutineResponseFind
	| DbSubroutineResponseFindById
	| DbSubroutineResponseFindByIds
	| DbSubroutineResponseIncrement
	| DbSubroutineResponseReadFileContentsById
	| DbSubroutineResponseGetServerInfo
	| DbSubroutineResponseSave;

export interface DbSubroutineResponseTypesMap {
	deleteById: DbSubroutineResponseDeleteById;
	find: DbSubroutineResponseFind;
	findById: DbSubroutineResponseFindById;
	findByIds: DbSubroutineResponseFindByIds;
	increment: DbSubroutineResponseIncrement;
	readFileContentsById: DbSubroutineResponseReadFileContentsById;
	getServerInfo: DbSubroutineResponseGetServerInfo;
	save: DbSubroutineResponseSave;
}

export interface DbSubroutineOutputErrorBase {
	errorCode: string;
}
export type DbSubroutineResponseErrorBase = DbSubroutineResponse<DbSubroutineOutputErrorBase>;

export interface DbSubroutineOutputErrorForeignKey extends DbSubroutineOutputErrorBase {
	errorCode: '14';
	foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
}
export type DbSubroutineResponseErrorForeignKey =
	DbSubroutineResponse<DbSubroutineOutputErrorForeignKey>;

export type DbSubroutineResponseError =
	| DbSubroutineResponseErrorBase
	| DbSubroutineResponseErrorForeignKey;
