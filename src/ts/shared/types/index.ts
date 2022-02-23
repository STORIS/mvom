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

export type DecryptFunc<TOutput> = {
	(data: string | null): TOutput | null;
	(data: (string | null)[]): (TOutput | null)[];
};

export type EncryptFunc<TInput> = {
	(data: TInput | null): string | null;
	(data: (TInput | null)[]): (string | null)[];
};
