export * from './DbFeature';
export * from './DbSubroutineInput';
export * from './DbSubroutineOutput';
export * from './Encryption';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvRecord = (string | number | null | undefined | MvRecord)[];
