export * from './DbFeature';
export * from './DbSubroutineInput';
export * from './DbSubroutineOutput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvRecord = (string | number | null | undefined | MvRecord)[];

export type DecryptFunc = {
	(data: string | null): unknown | null;
	(data: (string | null)[]): (unknown | null)[];
};

export type EncryptFunc = {
	(data: unknown | null): string | null;
	(data: (unknown | null)[]): (string | null)[];
};
