import type Document from '../Document';
import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type { MvRecord } from '../types';

// #region types
export interface SchemaTypeDefinitionBase {
	path: `${number}` | `${number}.${number}` | `${number}.${number}.${number}` | number;
	dictionary?: string;
	required?: boolean;
	encrypted?: boolean;
}

type ValidationFunction = (value: unknown, document: Document) => boolean | Promise<boolean>;

export interface Validator {
	validationFn: ValidationFunction;
	message: string;
}
// #endregion

/** Abstract Base Schema Type */
abstract class BaseSchemaType {
	protected readonly validators: Validator[] = [];

	/** Create an array of foreign key definitions that will be validated before save */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public transformForeignKeyDefinitionsToDb(value: unknown): ForeignKeyDbDefinition[] {
		return [];
	}

	/** Cast to complex data type (when applicable) */
	public cast(value: unknown): unknown {
		return value;
	}

	/** Get value from mv data */
	public abstract get(record: MvRecord): unknown;

	/** Set value into mv data */
	public abstract set(record: MvRecord, value: unknown): MvRecord;

	/** Validate value */
	public abstract validate(value: unknown, document: Document): Promise<string[]>;
}

export default BaseSchemaType;
