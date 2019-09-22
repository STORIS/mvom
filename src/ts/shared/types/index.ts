export type ValidationFunction = () => boolean | Promise<boolean>;

export type SchemaValidator = ValidationFunction | [ValidationFunction, string];

export interface Validator {
	validator: ValidationFunction;
	message: string;
}
