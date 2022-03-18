import { InvalidParameterError } from './errors';
import {
	ArrayType,
	BooleanType,
	DocumentArrayType,
	EmbeddedType,
	ISOCalendarDateTimeType,
	ISOCalendarDateType,
	ISOTimeType,
	NestedArrayType,
	NumberType,
	StringType,
} from './schemaType';
import type { BaseScalarType, BaseSchemaType, SchemaTypeDefinitionScalar } from './schemaType';
import type { DecryptFn, EncryptFn } from './types';

// #region Types
type SchemaTypeDefinition =
	| Schema
	| SchemaTypeDefinitionScalar
	| SchemaDefinition
	| SchemaTypeDefinitionArray;

type SchemaTypeDefinitionArray =
	| Schema[]
	| SchemaTypeDefinitionScalar[]
	| SchemaTypeDefinitionScalar[][]
	| SchemaDefinition[]
	| SchemaDefinition[][];

export interface SchemaDefinition {
	[x: string]: SchemaTypeDefinition;
}

export interface SchemaForeignKeyDefinition {
	file: string | string[];
	keysToIgnore?: string[];
	entityName: string;
}

export interface SchemaCompoundForeignKeyDefinition {
	[key: number]: SchemaForeignKeyDefinition;
	splitCharacter: string;
}

export interface TypedDictionary {
	dictionaryName: string;
	type: SchemaTypeDefinitionScalar['type'];
}

export type DictionaryDefinition = string | TypedDictionary;

export interface SchemaConstructorOptions {
	dictionaries?: Record<string, DictionaryDefinition>;
	idMatch?: RegExp;
	idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
	encrypt?: EncryptFn;
	decrypt?: DecryptFn;
}

interface DictionaryTypeDetail {
	dictionaryName: string;
	type: BaseScalarType;
}

// #endregion

/** Schema constructor */
class Schema {
	/** Key/value pairs of schema object path structure and associated multivalue dictionary ids */
	public dictPaths: Map<string, DictionaryTypeDetail>;

	/** The compiled schema object path structure */
	public readonly paths: Map<string, BaseSchemaType>;

	/** Foreign key definition for the record id */
	public readonly idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;

	/** Regular expression to validate the record id against */
	public readonly idMatch?: RegExp;

	/** The schema definition passed to the constructor */
	private readonly definition: SchemaDefinition;

	/** Map of the compiled schema object position paths */
	private readonly positionPaths: Map<string, number[]>;

	/** Map of all subdocument schemas represented in this Schema with parentPath as key */
	private readonly subdocumentSchemas: Map<string, Schema>;

	/** Optional function to use for encryption of sensitive data */
	private readonly encrypt?: EncryptFn;

	/** Optional function to use for decryption of sensitive data */
	private readonly decrypt?: DecryptFn;

	public constructor(
		definition: SchemaDefinition,
		{ dictionaries = {}, idForeignKey, idMatch, encrypt, decrypt }: SchemaConstructorOptions = {},
	) {
		this.dictPaths = Object.entries(dictionaries).reduce(
			(acc, [dictionaryName, dictionaryDefinition]) =>
				typeof dictionaryDefinition === 'string'
					? acc.set(dictionaryName, {
							dictionaryName: dictionaryDefinition,
							type: this.castScalar({ type: 'string', path: Number.MIN_VALUE }),
					  })
					: acc.set(dictionaryName, {
							dictionaryName: dictionaryDefinition.dictionaryName,
							type: this.castScalar({ type: dictionaryDefinition.type, path: Number.MIN_VALUE }),
					  }),
			new Map<string, DictionaryTypeDetail>([
				[
					'_id',
					{
						dictionaryName: '@ID',
						type: this.castScalar({ type: 'string', path: Number.MIN_VALUE }),
					},
				],
			]),
		);

		this.idForeignKey = idForeignKey;
		this.idMatch = idMatch;
		this.definition = definition;
		this.positionPaths = new Map();
		this.subdocumentSchemas = new Map();
		this.encrypt = encrypt;
		this.decrypt = decrypt;

		this.paths = this.buildPaths(this.definition);
	}

	/** Get all multivalue data paths in this schema and its subdocument schemas */
	public getMvPaths(): number[][] {
		return Array.from(this.subdocumentSchemas.values()).reduce(
			(mvPaths, schema) => mvPaths.concat(schema.getMvPaths()),
			Array.from(this.positionPaths.values()).slice(),
		);
	}

	/** Transform the paths to positions */
	public transformPathsToDbPositions = (paths: string[]): number[] => {
		if (paths.length === 0) {
			return [];
		}
		const positionPaths = this.getPositionPaths();
		const positionKeys = Array.from(positionPaths.keys());
		const positions = paths.reduce((acc, positionPath) => {
			if (positionPaths.has(positionPath)) {
				// find the key in position paths
				// add position
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const [dbPosition] = positionPaths.get(positionPath)!;
				acc.add(dbPosition + 1);
			} else if (!positionPath.includes('.')) {
				// if the property is a parent key, we will add positions for all children
				// e.g we only pass property "name" to return all data for name.first, name.last, etc.
				const matchedPositionPaths = positionKeys.filter(
					(key) => key.split('.')[0] === positionPath,
				);
				matchedPositionPaths.forEach((key) => {
					// add child position
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const [dbPosition] = positionPaths.get(key)!;
					acc.add(dbPosition + 1);
				});
			}
			return acc;
		}, new Set<number>());

		return [...positions];
	};

	/**
	 * Get all positionPaths with path as key and position array as value including children schemas
	 * e.g. parent field 'foo' has a child schema which has ["bar",[2]], the returned positionPath will be ["foo.bar",[2]].
	 */
	private getPositionPaths(): Map<string, number[]> {
		// merge the positionPaths from subdocumentSchemas with parentPath appended by the childPath recursively
		return Array.from(this.subdocumentSchemas.entries()).reduce((mvPaths, [parentKey, schema]) => {
			const childrenPositions = schema.getPositionPaths();
			childrenPositions.forEach((subPath, subKey) => {
				mvPaths.set(`${parentKey}.${subKey}`, subPath);
			});
			return mvPaths;
		}, new Map(this.positionPaths));
	}

	/** Construct instance member paths */
	private buildPaths = (definition: SchemaDefinition, prev?: string): Map<string, BaseSchemaType> =>
		Object.entries(definition).reduce((acc, [key, value]) => {
			// construct flattened keypath
			const newKey = prev != null ? `${prev}.${key}` : key;

			if (Array.isArray(value)) {
				return acc.set(newKey, this.castArray(value, newKey));
			}

			if (this.isScalarDefinition(value)) {
				// cast this value as a schemaType
				return acc.set(newKey, this.processScalar(value, newKey));
			}

			if (value instanceof Schema) {
				// value is an already compiled schema - cast as embedded document
				this.handleSubDocumentSchemas(value, newKey);
				return acc.set(newKey, new EmbeddedType(value));
			}

			const nestedPaths = this.buildPaths(value, newKey);

			return new Map([...acc, ...nestedPaths]);
		}, new Map<string, BaseSchemaType>());

	/**
	 * Cast an array to a schemaType
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private castArray = (
		castee: SchemaTypeDefinitionArray,
		keyPath: string,
	): ArrayType | NestedArrayType | DocumentArrayType => {
		if (castee.length !== 1) {
			// a schema array definition must contain exactly one value of language-type object (which includes arrays)
			throw new InvalidParameterError({
				message: 'castee parameter must be an array containing a single object',
				parameterName: 'castee',
			});
		}

		const [arrayValue] = castee;

		if (Array.isArray(arrayValue)) {
			if (arrayValue.length !== 1) {
				// a schema nested array definition must contain exactly one schema definition
				throw new InvalidParameterError({
					message: 'castee parameter must be an array containing a single object',
					parameterName: 'castee',
				});
			}

			const [nestedArrayValue] = arrayValue;
			if (!this.isScalarDefinition(nestedArrayValue)) {
				throw new InvalidParameterError({
					message: 'nested array value of schema type definition must be a scalar',
					parameterName: 'castee',
				});
			}

			return new NestedArrayType(this.processScalar(nestedArrayValue, keyPath));
		}

		if (arrayValue instanceof Schema) {
			this.handleSubDocumentSchemas(arrayValue, keyPath);
			return new DocumentArrayType(arrayValue);
		}

		if (this.isScalarDefinition(arrayValue)) {
			return new ArrayType(this.processScalar(arrayValue, keyPath));
		}

		const subdocumentSchema = new Schema(arrayValue, {
			encrypt: this.encrypt,
			decrypt: this.decrypt,
		});
		this.handleSubDocumentSchemas(subdocumentSchema, keyPath);
		return new DocumentArrayType(subdocumentSchema);
	};

	/** Process a scalar schema definition */
	private processScalar(castee: SchemaTypeDefinitionScalar, keyPath: string) {
		const scalarType = this.castScalar(castee);

		// add to mvPath array
		this.positionPaths.set(keyPath, scalarType.path);

		// update dictPaths
		if (scalarType.dictionary != null) {
			this.dictPaths.set(keyPath, { dictionaryName: scalarType.dictionary, type: scalarType });
		}

		return scalarType;
	}

	/**
	 * Cast a scalar definition to a scalar schemaType
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private castScalar = (castee: SchemaTypeDefinitionScalar) => {
		const options = { encrypt: this.encrypt, decrypt: this.decrypt };
		let schemaTypeValue;

		switch (castee.type) {
			case 'boolean':
				schemaTypeValue = new BooleanType(castee, options);
				break;
			case 'ISOCalendarDateTime':
				schemaTypeValue = new ISOCalendarDateTimeType(castee, options);
				break;
			case 'ISOCalendarDate':
				schemaTypeValue = new ISOCalendarDateType(castee, options);
				break;
			case 'ISOTime':
				schemaTypeValue = new ISOTimeType(castee, options);
				break;
			case 'number':
				schemaTypeValue = new NumberType(castee, options);
				break;
			case 'string':
				schemaTypeValue = new StringType(castee, options);
				break;
			/* istanbul ignore next: the block below is for checking not implemented case for any new scalar value */
			default: {
				const exhaustiveCheck: never = castee;
				throw new InvalidParameterError({
					message: `Data definition does not contain a supported type value: ${exhaustiveCheck}`,
					parameterName: 'castee',
				});
			}
		}

		return schemaTypeValue;
	};

	/** Perform ancillary updates needed when a subdocument is in the Schema definition */
	private handleSubDocumentSchemas = (schema: Schema, keyPath: string) => {
		this.subdocumentSchemas.set(keyPath, schema);
		this.mergeSchemaDictionaries(schema, keyPath);
	};

	/** Determine if an object matches the structure of a scalar definition */
	private isScalarDefinition(
		schemaTypeDefinition: SchemaTypeDefinition,
	): schemaTypeDefinition is SchemaTypeDefinitionScalar {
		return (
			Object.prototype.hasOwnProperty.call(schemaTypeDefinition, 'type') &&
			Object.prototype.hasOwnProperty.call(schemaTypeDefinition, 'path')
		);
	}

	/** Merge subdocument schema dictionaries with the parent schema's dictionaries */
	private mergeSchemaDictionaries = (schema: Schema, keyPath: string) => {
		this.dictPaths = Array.from(schema.dictPaths).reduce(
			(acc, [subDictPath, subDictTypeDetail]) => {
				const dictKey = `${keyPath}.${subDictPath}`;

				return acc.set(dictKey, subDictTypeDetail);
			},
			this.dictPaths,
		);
	};
}

export default Schema;
