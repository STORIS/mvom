export type DecryptFn = {
	(data: string | null): unknown | null;
	(data: (string | null)[]): (unknown | null)[];
	(data: (string | null)[][]): (unknown | null)[][];
};

export type EncryptFn = <TData extends string | null | (string | null)[] | (string | null)[][]>(
	data: TData,
) => TData extends string
	? string
	: TData extends null
	? null
	: TData extends (string | null)[]
	? (string | null)[]
	: (string | null)[][];
