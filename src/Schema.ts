import type { RequiredModelMeta } from './compileModel';
import {
	BooleanDataTransformer,
	ISOCalendarDateDataTransformer,
	ISOCalendarDateTimeDataTransformer,
	ISOTimeDataTransformer,
	NumberDataTransformer,
	StringDataTransformer,
} from './dataTransformers';
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
import type {
	BaseSchemaType,
	SchemaTypeDefinitionBoolean,
	SchemaTypeDefinitionISOCalendarDate,
	SchemaTypeDefinitionISOCalendarDateTime,
	SchemaTypeDefinitionISOTime,
	SchemaTypeDefinitionNumber,
	SchemaTypeDefinitionScalar,
	SchemaTypeDefinitionString,
	SchemaTypePath,
} from './schemaType';
import type {
	DataTransformer,
	DecryptFn,
	EncryptFn,
	FlattenObject,
	ISOCalendarDate,
	ISOCalendarDateTime,
	ISOTime,
	MarkRequired,
	MvRecord,
	Remap,
} from './types';

// #region Types
export type SchemaTypeDefinition =
	| Schema
	| SchemaTypeDefinitionScalar
	| SchemaDefinition
	| SchemaTypeDefinitionArray;

type SchemaTypeDefinitionArray =
	| readonly [Schema]
	| readonly [SchemaTypeDefinitionScalar]
	| readonly [[SchemaTypeDefinitionScalar]]
	| readonly [SchemaDefinition];

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- Record cannot circularly reference itself so index signature must be used. refer here: https://github.com/microsoft/TypeScript/pull/33050#issuecomment-714348057 for additional information
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

type PickAndMark<T extends SchemaTypeDefinitionScalar, K extends keyof T = never> = MarkRequired<
	Pick<T, 'dictionary' | 'type' | K>,
	'dictionary'
>;

export type DictionaryTypeDefinitionString = Remap<PickAndMark<SchemaTypeDefinitionString>>;
export type DictionaryTypeDefinitionNumber = Remap<PickAndMark<SchemaTypeDefinitionNumber>>;
export type DictionaryTypeDefinitionBoolean = Remap<PickAndMark<SchemaTypeDefinitionBoolean>>;
export type DictionaryTypeDefinitionISOCalendarDate = Remap<
	PickAndMark<SchemaTypeDefinitionISOCalendarDate>
>;
export type DictionaryTypeDefinitionISOCalendarDateTime = Remap<
	PickAndMark<SchemaTypeDefinitionISOCalendarDateTime, 'dbFormat'>
>;
export type DictionaryTypeDefinitionISOTime = Remap<
	PickAndMark<SchemaTypeDefinitionISOTime, 'dbFormat'>
>;

export type DictionaryTypeDefinition =
	| DictionaryTypeDefinitionString
	| DictionaryTypeDefinitionNumber
	| DictionaryTypeDefinitionBoolean
	| DictionaryTypeDefinitionISOCalendarDate
	| DictionaryTypeDefinitionISOCalendarDateTime
	| DictionaryTypeDefinitionISOTime;

export type DictionaryDefinition = string | DictionaryTypeDefinition;

export type DictionariesOption = Record<string, DictionaryDefinition>;
export interface SchemaConstructorOptions<TDictionaries extends DictionariesOption> {
	dictionaries?: TDictionaries;
	idMatch?: RegExp;
	idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
	encrypt?: EncryptFn;
	decrypt?: DecryptFn;
}

interface DictionaryTypeDetail {
	dictionary: string;
	dataTransformer: DataTransformer;
}

/** Infer whether a schema type definition is required and union the result with null if it is not */
type InferRequiredType<TScalar, TType> = TScalar extends { required: true } ? TType : TType | null;

/**
 * Infer the output of a string type definition with specific handling for enumerations
 * If an enumeration is a readonly array, the return type of the definition will be a union
 * of the array elements. Otherwise, the return type will be a string.
 */
type InferStringType<TString extends SchemaTypeDefinitionString> =
	TString['enum'] extends readonly (infer E)[] ? E : string;

/** Infer the output type of a schema type definition */
type InferSchemaType<TSchemaTypeDefinition, TConstraint> =
	TSchemaTypeDefinition extends SchemaTypeDefinitionBoolean
		? InferRequiredType<TSchemaTypeDefinition, boolean>
		: TSchemaTypeDefinition extends SchemaTypeDefinitionString
			? InferRequiredType<TSchemaTypeDefinition, InferStringType<TSchemaTypeDefinition>>
			: TSchemaTypeDefinition extends SchemaTypeDefinitionNumber
				? InferRequiredType<TSchemaTypeDefinition, number>
				: TSchemaTypeDefinition extends SchemaTypeDefinitionISOCalendarDate
					? InferRequiredType<TSchemaTypeDefinition, ISOCalendarDate>
					: TSchemaTypeDefinition extends SchemaTypeDefinitionISOCalendarDateTime
						? InferRequiredType<TSchemaTypeDefinition, ISOCalendarDateTime>
						: TSchemaTypeDefinition extends SchemaTypeDefinitionISOTime
							? InferRequiredType<TSchemaTypeDefinition, ISOTime>
							: TSchemaTypeDefinition extends Schema<infer TSubSchemaDefinition>
								? InferDocumentObject<Schema<TSubSchemaDefinition>, TConstraint>
								: TSchemaTypeDefinition extends SchemaTypeDefinitionArray
									? InferSchemaType<TSchemaTypeDefinition[0], TConstraint>[]
									: TSchemaTypeDefinition extends SchemaDefinition
										? InferDocumentObject<Schema<TSchemaTypeDefinition>, TConstraint>
										: never;

/**
 * Infer the shape of a `Document` instance based upon the Schema it was instantiated with
 *
 * Allows a constraint to be specified to filter the output to only include properties of a specific type
 */
export type InferDocumentObject<TSchema extends Schema | null, TConstraint = SchemaTypeDefinition> =
	TSchema extends Schema<infer TSchemaDefinition>
		? {
				[K in keyof TSchemaDefinition as TSchemaDefinition[K] extends TConstraint
					? K
					: never]: InferSchemaType<TSchemaDefinition[K], TConstraint>;
			}
		: { _raw: MvRecord };

/** Infer the shape of a `Model` instance based upon the Schema it was instantiated with */
export type InferModelObject<TSchema extends Schema | null> = Remap<
	InferDocumentObject<TSchema> & RequiredModelMeta
>;

/**
 * Flatten a document to string keyPath (i.e. { "foo.bar.baz": number })
 *
 * Allows a constraint to be specified to filter the output to only include properties of a specific type
 */
export type FlattenDocument<TSchema extends Schema, TConstraint = SchemaTypeDefinition> =
	InferDocumentObject<TSchema, TConstraint> extends infer O extends Record<string, unknown>
		? FlattenObject<O>
		: never;

/** Infer the string keyPaths of a schema */
export type InferSchemaPaths<TSchema extends Schema> = Extract<
	keyof FlattenDocument<TSchema>,
	string
>;
// #endregion

/** Schema constructor */
class Schema<
	TSchemaDefinition extends SchemaDefinition = SchemaDefinition,
	TDictionaries extends DictionariesOption = Record<never, never>,
> {
	/** Key/value pairs of schema object path structure and associated multivalue dictionary ids */
	public dictPaths: Map<string, DictionaryTypeDetail>;

	/** The compiled schema object path structure */
	public readonly paths: Map<string, BaseSchemaType>;

	/** Foreign key definition for the record id */
	public readonly idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;

	/** Regular expression to validate the record id against */
	public readonly idMatch?: RegExp;

	/** The schema definition passed to the constructor */
	private readonly definition: TSchemaDefinition;

	/** Map of the compiled schema object position paths */
	private readonly positionPaths: Map<string, SchemaTypePath>;

	/** Map of all subdocument schemas represented in this Schema with parentPath as key */
	private readonly subdocumentSchemas: Map<string, Schema>;

	/** Optional function to use for encryption of sensitive data */
	private readonly encrypt?: EncryptFn;

	/** Optional function to use for decryption of sensitive data */
	private readonly decrypt?: DecryptFn;

	public constructor(
		definition: TSchemaDefinition,
		{
			dictionaries,
			idForeignKey,
			idMatch,
			encrypt,
			decrypt,
		}: SchemaConstructorOptions<TDictionaries> = {},
	) {
		this.idForeignKey = idForeignKey;
		this.idMatch = idMatch;
		this.definition = definition;
		this.positionPaths = new Map();
		this.subdocumentSchemas = new Map();
		this.encrypt = encrypt;
		this.decrypt = decrypt;

		this.dictPaths = this.buildDictionaryPaths(dictionaries);
		this.paths = this.buildPaths(this.definition);
	}

	/** Get all multivalue data paths in this schema and its subdocument schemas */
	public getMvPaths(): SchemaTypePath[] {
		return Array.from(this.subdocumentSchemas.values()).reduce(
			(mvPaths, schema) => mvPaths.concat(schema.getMvPaths()),
			Array.from(this.positionPaths.values()).slice(),
		);
	}

	/** Transform the paths to positions */
	public transformPathsToDbPositions(paths: string[]): number[] {
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
	}

	/**
	 * Transform the path to its ordinal position. Returning a '.' delimited string. Ex. "1.2.3"
	 * @throws {Error} Invalid path provided
	 */
	public transformPathToOrdinalPosition(
		path: InferSchemaPaths<Schema<TSchemaDefinition, TDictionaries>>,
	): `${number}.${number}.${number}` {
		const positionPaths = this.getPositionPaths();

		const ordinalPath = positionPaths.get(path);
		if (ordinalPath == null) {
			throw new Error('Invalid path provided');
		}

		const [attributePosition, valuePosition = 0, subvaluePosition = 0] = ordinalPath;
		return `${attributePosition + 1}.${valuePosition + 1}.${subvaluePosition + 1}`;
	}

	/** Build the dictionary path map for additional dictionaries provided as schema options */
	private buildDictionaryPaths(
		dictionaries: DictionariesOption = {},
	): Map<string, DictionaryTypeDetail> {
		// Add reference for _id --> @ID by default
		const dictPaths = new Map<string, DictionaryTypeDetail>([
			['_id', { dictionary: '@ID', dataTransformer: new StringDataTransformer() }],
		]);

		return Object.entries(dictionaries).reduce((acc, [queryProperty, dictionaryDefinition]) => {
			if (typeof dictionaryDefinition === 'string') {
				return acc.set(queryProperty, {
					dictionary: dictionaryDefinition,
					dataTransformer: new StringDataTransformer(),
				});
			}

			const { type, dictionary } = dictionaryDefinition;

			switch (type) {
				case 'string':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new StringDataTransformer(),
					});
				case 'number':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new NumberDataTransformer(),
					});
				case 'boolean':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new BooleanDataTransformer(),
					});
				case 'ISOCalendarDate':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new ISOCalendarDateDataTransformer(),
					});
				case 'ISOCalendarDateTime':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new ISOCalendarDateTimeDataTransformer(dictionaryDefinition.dbFormat),
					});
				case 'ISOTime':
					return acc.set(queryProperty, {
						dictionary,
						dataTransformer: new ISOTimeDataTransformer(dictionaryDefinition.dbFormat),
					});
				default:
					return acc;
			}
		}, dictPaths);
	}

	/**
	 * Get all positionPaths with path as key and position array as value including children schemas
	 * e.g. parent field 'foo' has a child schema which has ["bar",[2]], the returned positionPath will be ["foo.bar",[2]].
	 */
	private getPositionPaths(): Map<string, SchemaTypePath> {
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
	private buildPaths(definition: SchemaDefinition, prev?: string): Map<string, BaseSchemaType> {
		return Object.entries(definition).reduce((acc, [key, value]) => {
			// construct flattened keypath
			const newKey = prev != null ? `${prev}.${key}` : key;

			if (Array.isArray(value)) {
				return acc.set(newKey, this.castArray(value as SchemaTypeDefinitionArray, newKey));
			}

			if (this.isScalarDefinition(value)) {
				// cast this value as a schemaType
				return acc.set(newKey, this.castScalar(value, newKey));
			}

			if (value instanceof Schema) {
				// value is an already compiled schema - cast as embedded document
				this.handleSubDocumentSchemas(value, newKey);
				return acc.set(newKey, new EmbeddedType(value));
			}

			const nestedPaths = this.buildPaths(value as SchemaDefinition, newKey);

			return new Map([...acc, ...nestedPaths]);
		}, new Map<string, BaseSchemaType>());
	}

	/**
	 * Cast an array to a schemaType
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private castArray(
		castee: SchemaTypeDefinitionArray,
		keyPath: string,
	): ArrayType | NestedArrayType | DocumentArrayType<Schema> {
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

			return new NestedArrayType(this.castScalar(nestedArrayValue, keyPath));
		}

		if (arrayValue instanceof Schema) {
			this.handleSubDocumentSchemas(arrayValue, keyPath);
			return new DocumentArrayType(arrayValue);
		}

		if (this.isScalarDefinition(arrayValue)) {
			return new ArrayType(this.castScalar(arrayValue, keyPath));
		}

		const subdocumentSchema = new Schema(arrayValue, {
			encrypt: this.encrypt,
			decrypt: this.decrypt,
		});
		this.handleSubDocumentSchemas(subdocumentSchema, keyPath);
		return new DocumentArrayType(subdocumentSchema);
	}

	/**
	 * Cast a scalar definition to a scalar schemaType
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private castScalar(castee: SchemaTypeDefinitionScalar, keyPath: string) {
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
			default: {
				const exhaustiveCheck: never = castee;
				throw new InvalidParameterError({
					message: `Data definition does not contain a supported type value: ${exhaustiveCheck}`,
					parameterName: 'castee',
				});
			}
		}

		// add to mvPath array
		this.positionPaths.set(keyPath, schemaTypeValue.path);

		// update dictPaths
		if (schemaTypeValue.dictionary != null) {
			this.dictPaths.set(keyPath, {
				dictionary: schemaTypeValue.dictionary,
				dataTransformer: schemaTypeValue,
			});
		}

		return schemaTypeValue;
	}

	/** Perform ancillary updates needed when a subdocument is in the Schema definition */
	private handleSubDocumentSchemas<TSchema extends Schema>(schema: TSchema, keyPath: string) {
		this.subdocumentSchemas.set(keyPath, schema);
		this.mergeSchemaDictionaries(schema, keyPath);
	}

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
	private mergeSchemaDictionaries<TSchema extends Schema>(schema: TSchema, keyPath: string) {
		this.dictPaths = Array.from(schema.dictPaths).reduce(
			(acc, [subDictPath, subDictTypeDetail]) => {
				const dictKey = `${keyPath}.${subDictPath}`;

				return acc.set(dictKey, subDictTypeDetail);
			},
			this.dictPaths,
		);
	}
}

export default Schema;
