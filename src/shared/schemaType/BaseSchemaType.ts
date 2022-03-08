import type { ForeignKeyDbDefinition } from '../classes/ForeignKeyDbTransformer';
import type { GenericObject, MvRecord, Validator } from '../types';

export interface SchemaTypeDefinitionBase {
	path: `${number}` | `${number}.${number}` | `${number}.${number}.${number}` | number;
	dictionary?: string;
	required?: boolean;
	encrypted?: boolean;
}

/** Abstract Base Schema Type */
abstract class BaseSchemaType {
	protected validators: Validator[] = [];

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
	public abstract validate(value: unknown, document: GenericObject): Promise<string[]>;
}

export default BaseSchemaType;
