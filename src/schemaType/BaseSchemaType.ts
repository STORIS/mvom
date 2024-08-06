import type { ForeignKeyDbDefinition } from '../ForeignKeyDbTransformer';
import type { MvAttribute, MvRecord } from '../types';
import { ensureArray } from '../utils';

// #region types
export type SchemaTypeDefinitionPath =
	| `${number}`
	| `${number}.${number}`
	| `${number}.${number}.${number}`
	| number;

export interface SchemaTypeDefinitionBase {
	path: SchemaTypeDefinitionPath;
	dictionary?: string;
	required?: boolean;
	encrypted?: boolean;
}

type ValidationFunction = (value: unknown) => boolean;

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

	/** Get data from a multivalue array at a given path */
	public getFromMvArray(path: number[], record: MvRecord = []): MvAttribute {
		// if the entire contents of the record at the base path is null then we must treat this as a special case:
		// - returning undefined won't alter the behavior of scalar data types (e.g. string, Boolean) since the undefined
		//   value will essentially get typecast back into null which is handled by all scalar types.
		// - it is important to all "array" types that null be interpreted differently, however.  A null for a value intended
		//   to become an array needs to be treated as an empty array, which is different than an array of null.  Returning
		//   undefined here will allow the array types to detect this event and behave accordingly.
		const attributeData = record[path[0]];
		if (attributeData == null) {
			return undefined;
		}

		if (path.length === 3 && Array.isArray(attributeData) && attributeData[path[1]] == null) {
			return undefined;
		}

		// lodash.get will not work here because "array" data might be returned from multi-value that still
		// appears like a non-array; if that happens, lodash.get would return the character at that string position instead;
		// this reducer ensures that the appropriate value is retrieved.
		return path.slice(1).reduce((acc, pathPart) => ensureArray(acc)[pathPart], attributeData);
	}

	/** Get value from mv data */
	public abstract get(record: MvRecord): unknown;

	/** Set value into mv data */
	public abstract set(record: MvRecord, value: unknown): MvRecord;

	/** Validate value */
	public abstract validate(value: unknown): string[] | Map<string, string[]>;
}

export default BaseSchemaType;
