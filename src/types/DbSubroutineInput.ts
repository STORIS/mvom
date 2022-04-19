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

export interface DbActionInputSubroutine<TSubroutineOptions extends GenericObject> {
	action: 'subroutine';
	subroutineId: string;
	setupId: string;
	setupOptions: DbSubroutineSetupOptions;
	teardownId: string;
	teardownOptions: Record<string, never>;
	options: TSubroutineOptions;
}

export interface DbSubroutineOptionsDeleteById {
	filename: string;
	id: string;
}

export interface DbSubroutineOptionsDeploy {
	sourceDir: string;
	source: string;
	programName: string;
}

export interface DbSubroutineOptionsFind {
	filename: string;
	queryCommand: string;
	projection: number[];
}

export interface DbSubroutineOptionsFindById {
	filename: string;
	id: string;
	projection: number[];
}

export interface DbSubroutineOptionsFindByIds {
	filename: string;
	ids: string[];
	projection: number[];
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
	| DbSubroutineOptionsDeploy
	| DbSubroutineOptionsFind
	| DbSubroutineOptionsFindById
	| DbSubroutineOptionsFindByIds
	| DbSubroutineOptionsReadFileContentsById
	| DbSubroutineOptionsGetServerInfo
>;

export interface DbSubroutineInputOptionsMap {
	deleteById: DbSubroutineOptionsDeleteById;
	deploy: DbSubroutineOptionsDeploy;
	find: DbSubroutineOptionsFind;
	findById: DbSubroutineOptionsFindById;
	findByIds: DbSubroutineOptionsFindByIds;
	readFileContentsById: DbSubroutineOptionsReadFileContentsById;
	getServerInfo: DbSubroutineOptionsGetServerInfo;
	save: DbSubroutineOptionsSave;
}
