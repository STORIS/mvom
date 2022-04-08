// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvDataType = string | null | undefined;

export type MvAttribute = MvDataType | (MvDataType | MvDataType[])[];

export type MvRecord = MvAttribute[];

/** Characters which delimit strings on multivalue database server */
export interface DbServerDelimiters {
	/** Record mark */
	rm: string;
	/** Attribute mark */
	am: string;
	/** Value mark */
	vm: string;
	/** Subvalue mark */
	svm: string;
}
