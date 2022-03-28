// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type MvDataType = string | number | null | undefined;

export type MvAttribute = MvDataType | (MvDataType | MvDataType[])[];

export type MvRecord = MvAttribute[];

/** Characters which delimit strings on multivalue database server */
export interface DbServerDelimiters {
	/**
	 * Record mark
	 * @defaultValue String.fromCharCode(255)
	 */
	rm: string;
	/**
	 * Attribute mark
	 * @defaultValue String.fromCharCode(254)
	 */
	am: string;
	/**
	 * Value mark
	 * * @defaultValue String.fromCharCode(253)
	 */
	vm: string;
	/**
	 * Subvalue mark
	 * @defaultValue String.fromCharCode(252)
	 */
	svm: string;
}
