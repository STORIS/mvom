export type DecryptFn = {
	(data: string | null): unknown | null;
	(data: (string | null)[]): (unknown | null)[];
};

export type EncryptFn = {
	(data: unknown | null): string | null;
	(data: (unknown | null)[]): (string | null)[];
};
