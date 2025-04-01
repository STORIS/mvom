import type { BuildForeignKeyDefinitionsResult } from '../Document';

export interface DbSubroutineUserDefinedOptions {
	option1?: string;
	option2?: string;
	option3?: string;
	option4?: string;
	option5?: string;
}

export interface DbSubroutineSetupOptions {
	userDefined?: DbSubroutineUserDefinedOptions;
	/** Trace ID passed as a request header. Defined here for future use by the database server logic */
	requestId?: string;
	/** Maximum allowed return payload size in bytes */
	maxReturnPayloadSize?: number;
}

export interface DbSubroutinePayload<TSubroutineInput extends object> {
	subroutineId: string;
	setupOptions: DbSubroutineSetupOptions;
	teardownOptions: Record<string, never>;
	subroutineInput: TSubroutineInput;
}

export interface DbSubroutineInputDeleteById {
	filename: string;
	id: string;
}

export interface DbSubroutineInputFind {
	filename: string;
	queryCommand: string;
	projection: number[] | null;
}

export interface DbSubroutineInputFindById {
	filename: string;
	id: string;
	projection: number[] | null;
}

export interface DbSubroutineInputFindByIds {
	filename: string;
	ids: string[];
	projection: number[] | null;
}

export interface DbSubroutineInputIncrementOperation {
	/**
	 * Ordinal path to the field to increment ex. 1.2.3
	 */
	path: string;
	/**
	 * Numeric value to increment by
	 */
	value: number;
}

export interface DbSubroutineInputIncrement {
	filename: string;
	id: string;
	operations: DbSubroutineInputIncrementOperation[];
	/**
	 * Number of retries to perform
	 */
	retry: number;
	/**
	 * Delay between retries in seconds
	 */
	retryDelay: number;
}

export interface DbSubroutineInputReadFileContentsById {
	filename: string;
	id: string;
}

export type DbSubroutineInputGetServerInfo = Record<string, never>;

export interface DbSubroutineInputSave {
	filename: string;
	id: string;
	__v?: string | null;
	record: string;
	foreignKeyDefinitions: BuildForeignKeyDefinitionsResult[];
}

export interface DbSubroutineInputCheckForRecordLock {
	filename: string;
	id: string;
}

export type DbActionSubroutineInputTypes = DbSubroutinePayload<
	| DbSubroutineInputDeleteById
	| DbSubroutineInputFind
	| DbSubroutineInputFindById
	| DbSubroutineInputFindByIds
	| DbSubroutineInputIncrement
	| DbSubroutineInputReadFileContentsById
	| DbSubroutineInputGetServerInfo
	| DbSubroutineInputCheckForRecordLock
>;

export interface DbSubroutineInputOptionsMap {
	deleteById: DbSubroutineInputDeleteById;
	find: DbSubroutineInputFind;
	findById: DbSubroutineInputFindById;
	findByIds: DbSubroutineInputFindByIds;
	increment: DbSubroutineInputIncrement;
	readFileContentsById: DbSubroutineInputReadFileContentsById;
	getServerInfo: DbSubroutineInputGetServerInfo;
	save: DbSubroutineInputSave;
	checkForRecordLockById: DbSubroutineInputCheckForRecordLock;
}
