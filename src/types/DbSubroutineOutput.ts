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
export type DbActionResponseSubroutineDeleteById =
	DbSubroutineResponse<DbSubroutineOutputDeleteById>;

export interface DbSubroutineOutputFind {
	count: number;
	documents: DbDocument[];
}
export type DbActionResponseSubroutineFind = DbSubroutineResponse<DbSubroutineOutputFind>;

export interface DbSubroutineOutputFindById {
	result: DbDocument | null;
}
export type DbActionResponseSubroutineFindById = DbSubroutineResponse<DbSubroutineOutputFindById>;

export interface DbSubroutineOutputFindByIds {
	result: (DbDocument | null)[];
}
export type DbActionResponseSubroutineFindByIds = DbSubroutineResponse<DbSubroutineOutputFindByIds>;

export interface DbSubroutineOutputReadFileContentsById {
	result: string;
}
export type DbActionResponseSubroutineReadFileContentsById =
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
export type DbActionResponseSubroutineGetServerInfo =
	DbSubroutineResponse<DbSubroutineOutputGetServerInfo>;

export interface DbSubroutineOutputSave {
	result: DbDocument;
}
export type DbActionResponseSubroutineSave = DbSubroutineResponse<DbSubroutineOutputSave>;

export type DbSubroutineResponseTypes =
	| DbActionResponseSubroutineDeleteById
	| DbActionResponseSubroutineFind
	| DbActionResponseSubroutineFindById
	| DbActionResponseSubroutineFindByIds
	| DbActionResponseSubroutineReadFileContentsById
	| DbActionResponseSubroutineGetServerInfo
	| DbActionResponseSubroutineSave;

export interface DbSubroutineResponseTypesMap {
	deleteById: DbActionResponseSubroutineDeleteById;
	find: DbActionResponseSubroutineFind;
	findById: DbActionResponseSubroutineFindById;
	findByIds: DbActionResponseSubroutineFindByIds;
	readFileContentsById: DbActionResponseSubroutineReadFileContentsById;
	getServerInfo: DbActionResponseSubroutineGetServerInfo;
	save: DbActionResponseSubroutineSave;
}
