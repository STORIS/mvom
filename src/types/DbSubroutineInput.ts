import type { BuildForeignKeyDefinitionsResult } from '../Document';
import type { GenericObject } from '.';

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

export interface DbSubroutinePayload<TSubroutineInput extends GenericObject> {
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

export type DbActionSubroutineInputTypes = DbSubroutinePayload<
	| DbSubroutineInputDeleteById
	| DbSubroutineInputFind
	| DbSubroutineInputFindById
	| DbSubroutineInputFindByIds
	| DbSubroutineInputReadFileContentsById
	| DbSubroutineInputGetServerInfo
>;

export interface DbSubroutineInputOptionsMap {
	deleteById: DbSubroutineInputDeleteById;
	find: DbSubroutineInputFind;
	findById: DbSubroutineInputFindById;
	findByIds: DbSubroutineInputFindByIds;
	readFileContentsById: DbSubroutineInputReadFileContentsById;
	getServerInfo: DbSubroutineInputGetServerInfo;
	save: DbSubroutineInputSave;
}
