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
	BaseScalarType,
	BaseSchemaType,
	SchemaTypeDefinitionBoolean,
	SchemaTypeDefinitionISOCalendarDate,
	SchemaTypeDefinitionISOCalendarDateTime,
	SchemaTypeDefinitionISOTime,
	SchemaTypeDefinitionNumber,
	SchemaTypeDefinitionScalar,
	SchemaTypeDefinitionString,
} from './schemaType';
import type { DataTransformer, DecryptFn, EncryptFn, MarkRequired } from './types';

// #region Types
type SchemaTypeDefinition =
	| Schema<SchemaDefinition>
	| SchemaTypeDefinitionScalar
	| SchemaDefinition
	| SchemaTypeDefinitionArray;

type SchemaTypeDefinitionArray =
	| SchemaTypeDefinitionScalar[]
	| SchemaTypeDefinitionScalar[][]
	| SchemaDefinition[]
	| Schema<SchemaDefinition>[];

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

export type DictionaryTypeDefinition =
	| PickAndMark<SchemaTypeDefinitionString>
	| PickAndMark<SchemaTypeDefinitionNumber>
	| PickAndMark<SchemaTypeDefinitionBoolean>
	| PickAndMark<SchemaTypeDefinitionISOCalendarDate>
	| PickAndMark<SchemaTypeDefinitionISOCalendarDateTime, 'dbFormat'>
	| PickAndMark<SchemaTypeDefinitionISOTime, 'dbFormat'>;

export type DictionaryDefinition = string | DictionaryTypeDefinition;

export interface SchemaConstructorOptions {
	dictionaries?: Record<string, DictionaryDefinition>;
	idMatch?: RegExp;
	idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
	encrypt?: EncryptFn;
	decrypt?: DecryptFn;
}

interface DictionaryTypeDetail {
	dictionary: string;
	dataTransformer: DataTransformer;
}

type InferRequiredType<TScalar, TType> = TScalar extends { required: true } ? TType : TType | null;

type InferStringType<TString extends SchemaTypeDefinitionString> =
	TString['enum'] extends readonly (infer E)[] ? E : string;

type InferSchemaType<TSchemaTypeDefinition> =
	TSchemaTypeDefinition extends SchemaTypeDefinitionBoolean
		? InferRequiredType<TSchemaTypeDefinition, boolean>
		: TSchemaTypeDefinition extends SchemaTypeDefinitionString
			? InferRequiredType<TSchemaTypeDefinition, InferStringType<TSchemaTypeDefinition>>
			: TSchemaTypeDefinition extends SchemaTypeDefinitionNumber
				? InferRequiredType<TSchemaTypeDefinition, number>
				: TSchemaTypeDefinition extends SchemaTypeDefinitionISOCalendarDate
					? InferRequiredType<TSchemaTypeDefinition, `${number}-${number}-${number}`>
					: TSchemaTypeDefinition extends SchemaTypeDefinitionISOCalendarDateTime
						? InferRequiredType<
								TSchemaTypeDefinition,
								`${number}-${number}-${number}T${number}:${number}:${number}.${number}`
							>
						: TSchemaTypeDefinition extends SchemaTypeDefinitionISOTime
							? InferRequiredType<TSchemaTypeDefinition, `${number}:${number}:${number}.${number}`>
							: TSchemaTypeDefinition extends Schema<infer SubSchemaDefinition>
								? { [K in keyof SubSchemaDefinition]: InferSchemaType<SubSchemaDefinition[K]> }
								: TSchemaTypeDefinition extends SchemaTypeDefinitionArray
									? InferSchemaType<TSchemaTypeDefinition[0]>[]
									: TSchemaTypeDefinition extends SchemaDefinition
										? {
												[K in keyof TSchemaTypeDefinition]: InferSchemaType<
													TSchemaTypeDefinition[K]
												>;
											}
										: never;

export type InferSchemaObject<TSchema extends Schema<SchemaDefinition>> =
	TSchema extends Schema<infer TSchemaDefinition>
		? { _id: string; __v: string } & {
				[K in keyof TSchemaDefinition]: InferSchemaType<TSchemaDefinition[K]>;
			} extends infer O
			? { [K in keyof O]: O[K] }
			: never
		: never;
// #endregion

/** Schema constructor */
class Schema<TSchemaDefinition extends SchemaDefinition> {
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
	private readonly positionPaths: Map<string, number[]>;

	/** Map of all subdocument schemas represented in this Schema with parentPath as key */
	private readonly subdocumentSchemas: Map<string, Schema<SchemaDefinition>>;

	/** Optional function to use for encryption of sensitive data */
	private readonly encrypt?: EncryptFn;

	/** Optional function to use for decryption of sensitive data */
	private readonly decrypt?: DecryptFn;

	public constructor(
		definition: TSchemaDefinition,
		{ dictionaries = {}, idForeignKey, idMatch, encrypt, decrypt }: SchemaConstructorOptions = {},
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
	public getMvPaths(): number[][] {
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

	/** Build the dictionary path map for additional dictionaries provided as schema options */
	private buildDictionaryPaths(
		dictionaries: Record<string, DictionaryDefinition>,
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
	private buildPaths<TPathDefinition extends SchemaDefinition>(
		definition: TPathDefinition,
		prev?: string,
	): Map<string, BaseSchemaType> {
		return Object.entries(definition).reduce((acc, [key, value]) => {
			// construct flattened keypath
			const newKey = prev != null ? `${prev}.${key}` : key;

			if (Array.isArray(value)) {
				return acc.set(newKey, this.castArray(value, newKey));
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

			const nestedPaths = this.buildPaths(value, newKey);

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
	):
		| ArrayType<BaseScalarType>
		| NestedArrayType<BaseScalarType>
		| DocumentArrayType<Schema<SchemaDefinition>> {
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
		if (schemaTypeValue.path != null) {
			this.positionPaths.set(keyPath, schemaTypeValue.path);
		}

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
	private handleSubDocumentSchemas<TSubdocumentSchemaDefinition extends SchemaDefinition>(
		schema: Schema<TSubdocumentSchemaDefinition>,
		keyPath: string,
	) {
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
	private mergeSchemaDictionaries<TSubdocumentSchemaDefinition extends SchemaDefinition>(
		schema: Schema<TSubdocumentSchemaDefinition>,
		keyPath: string,
	) {
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
