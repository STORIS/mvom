import type { ForeignKeyDbDefinition } from '#shared/classes/ForeignKeyDbTransformer';
import type { GenericObject, Validator } from '#shared/types';

export interface SchemaTypeDefinitionBase {
	path: string | number;
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
	public abstract get(record: unknown[]): unknown;

	/** Set value into mv data */
	public abstract set(record: unknown[], value: unknown): unknown;

	/** Validate value */
	public abstract validate(value: unknown, document: GenericObject): Promise<string[]>;
}

export default BaseSchemaType;
