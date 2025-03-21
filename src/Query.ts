import type Connection from './Connection';
import { InvalidParameterError, QueryLimitError } from './errors';
import type LogHandler from './LogHandler';
import type {
	DictionariesOption,
	DictionaryDefinition,
	DictionaryTypeDefinitionBoolean,
	DictionaryTypeDefinitionISOCalendarDate,
	DictionaryTypeDefinitionISOCalendarDateTime,
	DictionaryTypeDefinitionISOTime,
	DictionaryTypeDefinitionNumber,
	DictionaryTypeDefinitionString,
	FlattenDocument,
	SchemaDefinition,
	SchemaTypeDefinition,
} from './Schema';
import type Schema from './Schema';
import type { SchemaTypeDefinitionScalar } from './schemaType';
import type {
	DbDocument,
	DbSubroutineInputFind,
	DbSubroutineSetupOptions,
	ISOCalendarDate,
	ISOCalendarDateTime,
	ISOTime,
} from './types';

// #region Types
export interface QueryConstructorOptions<TSchema extends Schema | null> {
	/** Skip the first _n_ results */
	skip?: number | null;
	/** Return only _n_ results */
	limit?: number | null;
	/** Sort criteria */
	sort?: SortCriteria<TSchema>;
	/** Return only the indicated properties */
	projection?: readonly string[];
}

export interface FilterOperators<TValue> {
	/** Equal */
	$eq?: TValue;
	/** Greater than */
	$gt?: NonNullable<TValue>;
	/** Greater than or equal to */
	$gte?: NonNullable<TValue>;
	/** Less than */
	$lt?: NonNullable<TValue>;
	/** Less than or equal to */
	$lte?: NonNullable<TValue>;
	/** Not equal */
	$ne?: TValue;
	/** String containing */
	$contains?: TValue extends string ? string : never;
	/** String starts with */
	$startsWith?: TValue extends string ? string : never;
	/** String ends with */
	$endsWith?: TValue extends string ? string : never;
	/** In list */
	$in?: readonly TValue[];
	/** Not in list */
	$nin?: readonly TValue[];
}

export interface RootFilterOperators<TSchema extends Schema | null> {
	/** Used to combine conditions with an and */
	$and?: readonly Filter<TSchema>[];
	/** Used to combine conditions with an or */
	$or?: readonly Filter<TSchema>[];
}

export type Condition<TValue> = TValue | readonly TValue[] | FilterOperators<TValue>;

/** Infer the type of a dictionary */
type InferDictionaryType<TDictionaryDefinition extends DictionaryDefinition> =
	TDictionaryDefinition extends string
		? string
		: TDictionaryDefinition extends DictionaryTypeDefinitionString
			? string
			: TDictionaryDefinition extends DictionaryTypeDefinitionNumber
				? number
				: TDictionaryDefinition extends DictionaryTypeDefinitionBoolean
					? boolean
					: TDictionaryDefinition extends DictionaryTypeDefinitionISOCalendarDate
						? ISOCalendarDate
						: TDictionaryDefinition extends DictionaryTypeDefinitionISOTime
							? ISOTime
							: TDictionaryDefinition extends DictionaryTypeDefinitionISOCalendarDateTime
								? ISOCalendarDateTime
								: never;

/** Infer the type of additional schema dictionaries */
type InferDictionariesType<TDictionariesOption extends DictionariesOption> = {
	[K in keyof TDictionariesOption]: InferDictionaryType<TDictionariesOption[K]> | null;
};

/** Type which will produce a flattened document of only scalars with dictionaries */
type FlattenedDocumentDictionaries<TSchema extends Schema> = FlattenDocument<
	TSchema,
	Exclude<SchemaTypeDefinition, SchemaTypeDefinitionScalar> | { dictionary: string }
>;

export type SchemaFilter<TSchema extends Schema | null> = (TSchema extends Schema<
	SchemaDefinition,
	infer TDictionariesOption
>
	? FlattenedDocumentDictionaries<TSchema> &
			InferDictionariesType<TDictionariesOption> extends infer O
		? { [Key in keyof O]?: Condition<O[Key]> }
		: never
	: Record<never, never>) & { _id?: Condition<string> };
export type SchemaFilterKeys<TSchema extends Schema | null> = Extract<
	keyof SchemaFilter<TSchema>,
	string
>;

/** Query Filter */
export type Filter<TSchema extends Schema | null> = RootFilterOperators<TSchema> &
	SchemaFilter<TSchema>;

/** Sort criteria */
export type SortCriteria<TSchema extends Schema | null> = readonly [
	SchemaFilterKeys<TSchema>,
	-1 | 1,
][];

export type QueryExecutionOptions = DbSubroutineSetupOptions;
export interface QueryExecutionResult {
	/** Number of documents returned */
	count: number;
	/** Unformatted documents returned from database */
	documents: DbDocument[];
}
// #endregion

/** A query object */
class Query<TSchema extends Schema | null> {
	/** Connection instance to run query on */
	private readonly connection: Connection;

	/** Schema used for query */
	private readonly schema: TSchema;

	/** File to run query against */
	private readonly file: string;

	/** Log handler instance used for diagnostic logging */
	private readonly logHandler: LogHandler;

	/** String to use as selection criteria in query */
	private readonly selection: string | null;

	/** String to use as sort criteria in query */
	private readonly sort: string | null;

	/** Sort criteria passed to constructor */
	private readonly sortCriteria?: SortCriteria<TSchema>;

	/** Limit the result set to this number of items */
	private readonly limit?: number | null;

	/** Skip this number of items in the result set */
	private readonly skip?: number | null;

	/** Specify the projection attribute in result set */
	private readonly projection: readonly string[] | null;

	/** Number of conditions in the query */
	private conditionCount = 0;

	public constructor(
		connection: Connection,
		schema: TSchema,
		file: string,
		logHandler: LogHandler,
		selectionCriteria: Filter<TSchema>,
		options: QueryConstructorOptions<TSchema> = {},
	) {
		const { sort, limit, skip, projection } = options;

		this.connection = connection;
		this.schema = schema;
		this.file = file;
		this.logHandler = logHandler;
		this.limit = limit;
		this.skip = skip;
		this.projection = projection ?? null;

		this.selection = this.formatSelectionCriteria(selectionCriteria);
		this.sortCriteria = sort;
		this.sort = this.formatSortCriteria(sort);
	}

	/** Execute query */
	public async exec(options: QueryExecutionOptions = {}): Promise<QueryExecutionResult> {
		const { maxReturnPayloadSize, requestId, userDefined } = options;
		let queryCommand = `select ${this.file}`;
		if (this.selection != null) {
			queryCommand = `${queryCommand} with ${this.selection}`;
		}
		if (this.sort != null) {
			queryCommand = `${queryCommand} ${this.sort}`;
		}

		await this.validateQuery(queryCommand, requestId);

		const projection =
			this.projection != null && this.schema != null
				? this.schema.transformPathsToDbPositions(this.projection)
				: null;

		const executionOptions: DbSubroutineInputFind = {
			filename: this.file,
			queryCommand,
			...(this.skip != null && { skip: this.skip }),
			...(this.limit != null && { limit: this.limit }),
			projection,
		};

		const setupOptions: DbSubroutineSetupOptions = {
			...(maxReturnPayloadSize != null && { maxReturnPayloadSize }),
			...(requestId != null && { requestId }),
			...(userDefined && { userDefined }),
		};

		this.logHandler.debug(`executing query "${queryCommand}"`);
		const data = await this.connection.executeDbSubroutine('find', executionOptions, setupOptions);

		return {
			count: data.count,
			documents: data.documents,
		};
	}

	/**
	 * Format the selection criteria object into a string to use in multivalue query
	 * @throws {@link TypeError} The value of the $or property must be an array
	 * @throws {@link TypeError} Invalid conditional operator specified
	 */
	private formatSelectionCriteria(criteria: Filter<TSchema>): string | null {
		const criteriaProperties = Object.keys(criteria);
		if (criteriaProperties.length === 0) {
			return null;
		}

		const andConditions = Object.entries(criteria).map(([queryProperty, queryValue]) => {
			if (queryProperty === '$or' || queryProperty === '$and') {
				if (!Array.isArray(queryValue) || queryValue.length === 0) {
					throw new TypeError(`The value of the ${queryProperty} property must be an array`);
				}

				const conditions = queryValue.map((queryObj) => this.formatSelectionCriteria(queryObj));
				if (conditions.length === 1) {
					return conditions[0];
				}

				const joinWord = queryProperty === '$or' ? ' or ' : ' and ';
				return `(${conditions.join(joinWord)})`;
			}

			if (Array.isArray(queryValue)) {
				// assume $in operator if queryValue is an array
				return this.formatConditionList(queryProperty, '=', queryValue, 'or');
			}

			if (typeof queryValue !== 'object' || queryValue === null) {
				// assume equality if queryValue is not an object or is equal null
				return this.formatCondition(queryProperty, '=', queryValue);
			}

			// if query value is an object then it should contain one or more pairs of operator and value
			const operatorConditions = Object.entries(queryValue).map(([operator, mvValue]) => {
				switch (operator) {
					case '$eq':
						return this.formatCondition(queryProperty, '=', mvValue);
					case '$gt':
						return this.formatNonNullableCondition(queryProperty, '>', mvValue);
					case '$gte':
						return this.formatNonNullableCondition(queryProperty, '>=', mvValue);
					case '$lt':
						return this.formatNonNullableCondition(queryProperty, '<', mvValue);
					case '$lte':
						return this.formatNonNullableCondition(queryProperty, '<=', mvValue);
					case '$ne':
						return this.formatCondition(queryProperty, '#', mvValue);
					case '$contains':
						this.validateLikeCondition(mvValue);
						return this.formatNonNullableCondition(queryProperty, 'like', `...'${mvValue}'...`);
					case '$startsWith':
						this.validateLikeCondition(mvValue);
						return this.formatNonNullableCondition(queryProperty, 'like', `'${mvValue}'...`);
					case '$endsWith':
						this.validateLikeCondition(mvValue);
						return this.formatNonNullableCondition(queryProperty, 'like', `...'${mvValue}'`);
					case '$in':
						return this.formatConditionList(queryProperty, '=', mvValue as unknown[], 'or');
					case '$nin':
						return this.formatConditionList(queryProperty, '#', mvValue as unknown[], 'and');
					default:
						// unknown operator
						throw new TypeError('Invalid conditional operator specified');
				}
			});

			return operatorConditions.length === 1
				? operatorConditions[0]
				: `(${operatorConditions.join(' and ')})`;
		});

		return andConditions.length === 1 ? andConditions[0] : `(${andConditions.join(' and ')})`;
	}

	/** Format the sort criteria object into a string to use in multivalue query */
	private formatSortCriteria(criteria?: SortCriteria<TSchema>): string | null {
		if (criteria == null || criteria.length === 0) {
			return null;
		}

		return criteria
			.map((sortEntry) => {
				const [sortProperty, sortOrder] = sortEntry;
				const dictionaryId = this.getDictionaryId(sortProperty);

				let byClause;
				if (sortOrder === -1) {
					byClause = 'by.dsnd';
				} else {
					byClause = 'by';
				}
				return `${byClause} ${dictionaryId}`;
			})
			.join(' ');
	}

	/**
	 * Format a conditional expression which prohibits null values
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private formatNonNullableCondition(property: string, operator: string, value: unknown): string {
		if (value == null) {
			throw new InvalidParameterError({ parameterName: 'value' });
		}

		return this.formatCondition(property, operator, value);
	}

	/** Format a conditional expression */
	private formatCondition(property: string, operator: string, value: unknown): string {
		this.conditionCount += 1;
		const dictionaryId = this.getDictionaryId(property);
		return `${dictionaryId} ${operator} ${this.formatConstant(property, value)}`;
	}

	/**
	 * Format a list of conditional expressions
	 * @throws {@link InvalidParameterError} An invalid parameter was passed to the function
	 */
	private formatConditionList(
		property: string,
		operator: string,
		valueList: readonly unknown[],
		joinString: string,
	): string {
		if (valueList.length === 0) {
			throw new InvalidParameterError({ parameterName: 'valueList' });
		}

		const conditionList = valueList.map((value) => this.formatCondition(property, operator, value));

		return conditionList.length === 1
			? conditionList[0]
			: `(${conditionList.join(` ${joinString} `)})`;
	}

	/**
	 * Format a constant for use in queries
	 * @throws {@link Error} Passed constant parameter contains both single and double quotes
	 */
	private formatConstant(property: string, constant: unknown): string {
		if (constant == null) {
			// convert null to empty string
			return '""';
		}

		const constantToFormat = this.transformToQuery(property, constant);

		if (
			typeof constantToFormat === 'string' &&
			constantToFormat.includes(`'`) &&
			constantToFormat.includes(`"`)
		) {
			// cannot query if string has both single and double quotes in it
			throw new Error('Query constants cannot contain both single and double quotes');
		}

		const quoteCharacter =
			typeof constantToFormat === 'string' && constantToFormat.includes(`"`) ? `'` : `"`;

		return `${quoteCharacter}${constantToFormat}${quoteCharacter}`;
	}

	/**
	 * Get a dictionary id at a given schema path
	 * @throws {link InvalidParameterError} Nonexistent schema property or property does not have a dictionary specified
	 */
	private getDictionaryId(property: string): string {
		const dictionaryTypeDetail = this.schema?.dictPaths.get(property);
		if (dictionaryTypeDetail == null) {
			throw new InvalidParameterError({
				message: 'Nonexistent schema property or property does not have a dictionary specified',
				parameterName: 'property',
			});
		}

		return dictionaryTypeDetail.dictionary;
	}

	/** Transform query constant to internal u2 format (if applicable) */
	private transformToQuery(property: string, constant: unknown): unknown {
		const dictionaryTypeDetail = this.schema?.dictPaths.get(property);
		if (dictionaryTypeDetail == null) {
			throw new InvalidParameterError({
				message: 'Nonexistent schema property or property does not have a dictionary specified',
				parameterName: 'property',
			});
		}

		return dictionaryTypeDetail.dataTransformer.transformToQuery(constant);
	}

	/** Validate the query before execution */
	private async validateQuery(query: string, requestId?: string): Promise<void> {
		const { maxSort, maxWith, maxSentenceLength } = await this.connection.getDbLimits({
			requestId,
		});

		/*
      For some reason, UDTEXECUTE (which is used by this library) appears to have a sentence length limit which is one character
      less than the sentence length limit used by EXECUTE.  The sentence length returned in the LIMIT values represent that of
      EXECUTE and not UDTEXECUTE.  The below code reduces the length by 1 to accommodate for that discrepancy.
    */
		if (query.length > maxSentenceLength - 1) {
			throw new QueryLimitError({
				message: 'Query length exceeds maximum sentence length of database server',
			});
		}

		if (this.sortCriteria != null && this.sortCriteria.length > maxSort) {
			throw new QueryLimitError({
				message: 'Query sort criteria exceeds maximum number of sort criteria of database server',
			});
		}

		if (this.conditionCount > maxWith) {
			throw new QueryLimitError({
				message:
					'Query condition count exceeds maximum number of query conditions of database server',
			});
		}
	}

	/** Validate that a "like" condition does not contain quotes and is not null */
	private validateLikeCondition(value: unknown): void {
		if (value == null) {
			throw new InvalidParameterError({ parameterName: 'value' });
		}

		const stringValue = String(value);

		if (stringValue.includes(`'`) || stringValue.includes(`"`)) {
			// cannot query if like condition has single or double quotes in it
			throw new Error(
				'$contains, $startsWith, and $endsWith queries cannot contain single or double quotes in the conditional value',
			);
		}
	}
}

export default Query;
