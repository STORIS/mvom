import type { DbActionResponse } from './DbFeature';
import type { MvRecord } from '.';

export interface DbDocument {
	_id: string;
	__v: string | null;
	record: MvRecord;
}

export interface DbSubroutineOutputDeleteById {
	result: DbDocument;
}
export type DbActionResponseSubroutineDeleteById = DbActionResponse<DbSubroutineOutputDeleteById>;

export interface DbSubroutineOutputDeploy {
	deployed: string;
}
export type DbActionResponseSubroutineDeploy = DbActionResponse<DbSubroutineOutputDeploy>;

export interface DbSubroutineOutputFind {
	documents: DbDocument[];
}
export type DbActionResponseSubroutineFind = DbActionResponse<DbSubroutineOutputFind>;

export interface DbSubroutineOutputFindById {
	result: DbDocument;
}
export type DbActionResponseSubroutineFindById = DbActionResponse<DbSubroutineOutputFindById>;

export interface DbSubroutineOutputFindByIds {
	result: DbDocument[];
}
export type DbActionResponseSubroutineFindByIds = DbActionResponse<DbSubroutineOutputFindByIds>;

export interface DbSubroutineOutputReadFileContentsById {
	result: string;
}
export type DbActionResponseSubroutineReadFileContentsById =
	DbActionResponse<DbSubroutineOutputReadFileContentsById>;

export interface DbSubroutineOutputGetServerInfo {
	date: number;
	time: number;
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
