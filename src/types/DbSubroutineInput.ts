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
}

export interface DbActionInputSubroutine<TSubroutineInput extends GenericObject> {
	subroutineId: string;
	setupOptions: DbSubroutineSetupOptions;
	teardownOptions: Record<string, never>;
	subroutineInput: TSubroutineInput;
}

export interface DbSubroutineOptionsDeleteById {
	filename: string;
	id: string;
}

export interface DbSubroutineOptionsFind {
	filename: string;
	queryCommand: string;
	projection: number[] | null;
}

export interface DbSubroutineOptionsFindById {
	filename: string;
	id: string;
	projection: number[] | null;
}

export interface DbSubroutineOptionsFindByIds {
	filename: string;
	ids: string[];
	projection: number[] | null;
}

export interface DbSubroutineOptionsReadFileContentsById {
	filename: string;
	id: string;
}

export type DbSubroutineOptionsGetServerInfo = Record<string, never>;

export interface DbSubroutineOptionsSave {
	filename: string;
	id: string;
	__v?: string | null;
	record: string;
	foreignKeyDefinitions: BuildForeignKeyDefinitionsResult[];
}

export type DbActionSubroutineInputTypes = DbActionInputSubroutine<
	| DbSubroutineOptionsDeleteById
	| DbSubroutineOptionsFind
	| DbSubroutineOptionsFindById
	| DbSubroutineOptionsFindByIds
	| DbSubroutineOptionsReadFileContentsById
	| DbSubroutineOptionsGetServerInfo
>;

export interface DbSubroutineInputOptionsMap {
	deleteById: DbSubroutineOptionsDeleteById;
	find: DbSubroutineOptionsFind;
	findById: DbSubroutineOptionsFindById;
	findByIds: DbSubroutineOptionsFindByIds;
	readFileContentsById: DbSubroutineOptionsReadFileContentsById;
	getServerInfo: DbSubroutineOptionsGetServerInfo;
	save: DbSubroutineOptionsSave;
}
