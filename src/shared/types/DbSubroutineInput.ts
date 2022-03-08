import type { BuildForeignKeyDefinitionsResult } from '../../Document';
import type { GenericObject, MvRecord } from '.';

export interface DbActionInputSubroutine<TSubroutineOptions extends GenericObject> {
	action: 'subroutine';
	subroutineId: string;
	setupId: string;
	setupOptions: Record<string, never>;
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
	clearAttributes: boolean;
	record: MvRecord;
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
