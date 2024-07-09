export type MvDataType = string | null | undefined;

export type MvAttribute = MvDataType | (MvDataType | MvDataType[])[];

export type MvRecord = MvAttribute[];
