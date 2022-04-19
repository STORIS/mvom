import type { DbActionResponse } from './DbFeature';

export interface DbDocument {
	_id: string;
	__v: string | null;
	record: string;
}

export interface DbSubroutineOutputDeleteById {
	result: DbDocument | null;
}
export type DbActionResponseSubroutineDeleteById = DbActionResponse<DbSubroutineOutputDeleteById>;

export interface DbSubroutineOutputDeploy {
	deployed: string;
}
export type DbActionResponseSubroutineDeploy = DbActionResponse<DbSubroutineOutputDeploy>;

export interface DbSubroutineOutputFind {
	count: number;
	documents: DbDocument[];
}
export type DbActionResponseSubroutineFind = DbActionResponse<DbSubroutineOutputFind>;

export interface DbSubroutineOutputFindById {
	result: DbDocument | null;
}
export type DbActionResponseSubroutineFindById = DbActionResponse<DbSubroutineOutputFindById>;

export interface DbSubroutineOutputFindByIds {
	result: (DbDocument | null)[];
}
export type DbActionResponseSubroutineFindByIds = DbActionResponse<DbSubroutineOutputFindByIds>;

export interface DbSubroutineOutputReadFileContentsById {
	result: string;
}
export type DbActionResponseSubroutineReadFileContentsById =
	DbActionResponse<DbSubroutineOutputReadFileContentsById>;

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
export type DbActionResponseSubroutineGetServerInfo =
	DbActionResponse<DbSubroutineOutputGetServerInfo>;

export interface DbSubroutineOutputSave {
	result: DbDocument;
}
export type DbActionResponseSubroutineSave = DbActionResponse<DbSubroutineOutputSave>;

export type DbSubroutineResponseTypes =
	| DbActionResponseSubroutineDeleteById
	| DbActionResponseSubroutineDeploy
	| DbActionResponseSubroutineFind
	| DbActionResponseSubroutineFindById
	| DbActionResponseSubroutineFindByIds
	| DbActionResponseSubroutineReadFileContentsById
	| DbActionResponseSubroutineGetServerInfo
	| DbActionResponseSubroutineSave;

export interface DbSubroutineResponseTypesMap {
	deleteById: DbActionResponseSubroutineDeleteById;
	deploy: DbActionResponseSubroutineDeploy;
	find: DbActionResponseSubroutineFind;
	findById: DbActionResponseSubroutineFindById;
	findByIds: DbActionResponseSubroutineFindByIds;
	readFileContentsById: DbActionResponseSubroutineReadFileContentsById;
	getServerInfo: DbActionResponseSubroutineGetServerInfo;
	save: DbActionResponseSubroutineSave;
}
