// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

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

interface PositionForeignKeyDefinition {
	[key: number]: SchemaForeignKeyDefinition;
}

export type SchemaCompoundForeignKeyDefinition = PositionForeignKeyDefinition & {
	splitCharacter: string;
};
