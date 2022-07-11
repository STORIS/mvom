// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvDataType = string | null | undefined;

export type MvAttribute = MvDataType | (MvDataType | MvDataType[])[];

export type MvRecord = MvAttribute[];
