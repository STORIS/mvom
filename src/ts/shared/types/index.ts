import type compileModel from '../../compileModel';

export * from './DbFeature';
export * from './DbSubroutineInput';
export * from './DbSubroutineOutput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvRecord = (string | number | null | undefined | MvRecord)[];

export type ValidationFunction = (
	value: unknown,
	document: GenericObject,
) => boolean | Promise<boolean>;

export type SchemaValidator = ValidationFunction | [ValidationFunction, string];

export interface Validator {
	validator: ValidationFunction;
	message: string;
}

export type DecryptFunc = {
	(data: string | null): unknown | null;
	(data: (string | null)[]): (unknown | null)[];
};

export type EncryptFunc = {
	(data: unknown | null): string | null;
	(data: (unknown | null)[]): (string | null)[];
};

export interface SchemaForeignKeyDefinition {
	file: string | string[];
	keysToIgnore?: string[];
	entityName: string;
}

export interface SchemaCompoundForeignKeyDefinition {
	[key: number]: SchemaForeignKeyDefinition;
	splitCharacter: string;
}

export interface Logger {
	error(message: string): void;
	warn(message: string): void;
	info(message: string): void;
	verbose(message: string): void;
	debug(message: string): void;
	silly(message: string): void;
}

export type ModelConstructor = ReturnType<typeof compileModel>;
