// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = Record<string, any>;

export type ValidationFunction = () => boolean | Promise<boolean>;

export type SchemaValidator = ValidationFunction | [ValidationFunction, string];

export interface Validator {
	validator: ValidationFunction;
	message: string;
}
