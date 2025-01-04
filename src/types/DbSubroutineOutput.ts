import type { DbErrorCodes, DbErrors } from '../constants';
import type { ForeignKeyValidationErrorData } from '../errors/ForeignKeyValidationError';

export interface DbDocument {
	_id: string;
	__v: string | null;
	record: string;
}

interface DbSubroutineResponse<TOutput> {
	output: TOutput;
}

interface DbSubroutineOutputDeleteById {
	result: DbDocument | null;
}
type DbSubroutineResponseDeleteById = DbSubroutineResponse<DbSubroutineOutputDeleteById>;

export interface DbSubroutineOutputFind {
	count: number;
	documents: DbDocument[];
}
type DbSubroutineResponseFind = DbSubroutineResponse<DbSubroutineOutputFind>;

interface DbSubroutineOutputFindById {
	result: DbDocument | null;
}
type DbSubroutineResponseFindById = DbSubroutineResponse<DbSubroutineOutputFindById>;

interface DbSubroutineOutputFindByIds {
	result: (DbDocument | null)[];
}
type DbSubroutineResponseFindByIds = DbSubroutineResponse<DbSubroutineOutputFindByIds>;

interface DbSubroutineOutputIncrement {
	originalDocument: DbDocument;
	updatedDocument: DbDocument;
}
type DbSubroutineResponseIncrement = DbSubroutineResponse<DbSubroutineOutputIncrement>;

interface DbSubroutineOutputReadFileContentsById {
	result: string;
}
type DbSubroutineResponseReadFileContentsById =
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
interface DbSubroutineOutputGetServerInfo {
	date: number;
	time: number;
	delimiters: DbServerDelimiters;
	limits: DbServerLimits;
}
type DbSubroutineResponseGetServerInfo = DbSubroutineResponse<DbSubroutineOutputGetServerInfo>;

interface DbSubroutineOutputSave {
	result: DbDocument;
}
type DbSubroutineResponseSave = DbSubroutineResponse<DbSubroutineOutputSave>;

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

type ForeignKeyValidationErrorCode = DbErrors['foreignKeyValidation']['code'];
type BaseErrorCodes = Exclude<DbErrorCodes, ForeignKeyValidationErrorCode>;

interface DbSubroutineOutputErrorBase {
	errorCode: BaseErrorCodes;
}
type DbSubroutineResponseErrorBase = DbSubroutineResponse<DbSubroutineOutputErrorBase>;

interface DbSubroutineOutputErrorForeignKey {
	errorCode: ForeignKeyValidationErrorCode;
	foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
}
type DbSubroutineResponseErrorForeignKey = DbSubroutineResponse<DbSubroutineOutputErrorForeignKey>;

export type DbSubroutineResponseError =
	| DbSubroutineResponseErrorBase
	| DbSubroutineResponseErrorForeignKey;
