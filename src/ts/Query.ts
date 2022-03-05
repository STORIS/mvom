import { InvalidParameterError } from '#shared/errors';
import { BaseScalarArrayType, BaseScalarType } from '#shared/schemaType';
import type { DbDocument, GenericObject } from '#shared/types';
import type { ModelConstructor } from './compileModel';

// #region Types
export interface FilterOperators<TValue> {
	/** Equal */
	$eq?: TValue;
	/** Greater than */
	$gt?: TValue;
	/** Greater than or equal to */
	$gte?: TValue;
	/** Less than */
	$lt?: TValue;
	/** Less than or equal to */
	$lte?: TValue;
	/** Not equal */
	$ne?: TValue;
	/** String containing */
	$contains?: TValue;
	/** String starts with */
	$startsWith?: TValue;
	/** String ends with */
	$endsWith?: TValue;
	/** In list */
	$in?: TValue[];
	/** Not in list */
	$nin?: TValue[];
}

export interface RootFilterOperators<TSchema> {
	/** Used to combine conditions with an and */
	$and?: Filter<TSchema>[];
	/** Used to combine conditions with an or */
	$or?: Filter<TSchema>[];
}

export type Condition<TValue> = TValue | TValue[] | FilterOperators<TValue>;

export type Filter<TSchema extends GenericObject = GenericObject> = {
	[key in keyof TSchema]?: Condition<TSchema[key]>;
} & RootFilterOperators<TSchema>;

export type SortCriteria = [string, -1 | 1][];

export interface QueryConstructorOptions {
	/** Skip the first _n_ results */
	skip?: number;
	/** Return only _n_ results */
	limit?: number;
	/** Sort criteria */
	sort?: SortCriteria;
	/** Return only the indicated properties */
	projection?: string[];
}

export interface QueryExecutionResult {
	/** Number of documents returned */
	count: number;
	/** Unformatted documents returned from database */
	documents: DbDocument[];
}
// #endregion

/** A query object */
class Query<TSchema extends GenericObject = GenericObject> {
	/** Model constructor to use with query */
	private Model: ModelConstructor;

	/** String to use as selection criteria in query */
	private selection: string | null;

	/** String to use as sort criteria in query */
	private sort: string | null;

	/** Limit the result set to this number of items */
	private limit?: number;

	/** Skip this number of items in the result set */
	private skip?: number;

	/** Specify the projection attribute in result set */
	private projection: string[];

	public constructor(
		Model: ModelConstructor,
		selectionCriteria: Filter<TSchema>,
		options: QueryConstructorOptions = {},
	) {
		const { sort, limit, skip, projection } = options;

		this.Model = Model;
		this.limit = limit;
		this.skip = skip;
		this.projection = projection ?? [];

		this.selection = this.formatSelectionCriteria(selectionCriteria);
		this.sort = this.formatSortCriteria(sort);
	}

	/** Execute query */
	public async exec(): Promise<QueryExecutionResult> {
		let queryCommand = `select ${this.Model.file}`;
		if (this.selection != null) {
			queryCommand = `${queryCommand} with ${this.selection}`;
		}
		if (this.sort != null) {
			queryCommand = `${queryCommand} ${this.sort}`;
		}

		const projection = this.Model.schema?.transformPathsToDbPositions(this.projection) ?? [];

		const options = {
			filename: this.Model.file,
			queryCommand,
			...(this.skip != null && { skip: this.skip }),
			...(this.limit != null && { limit: this.limit }),
			projection,
		};

		this.Model.connection.logger.debug(`executing query "${queryCommand}"`);
		const data = await this.Model.connection.executeDbFeature('find', options);

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

			if (typeof queryValue !== 'object') {
				// assume equality if queryValue is not an object
				return this.formatCondition(queryProperty, '=', queryValue);
			}

			// if query value is an object then it should contain one or more pairs of operator and value
			const operatorConditions = Object.entries(queryValue).map(([operator, mvValue]) => {
				switch (operator) {
					case '$eq':
						return this.formatCondition(queryProperty, '=', mvValue);
					case '$gt':
						return this.formatCondition(queryProperty, '>', mvValue);
					case '$gte':
						return this.formatCondition(queryProperty, '>=', mvValue);
					case '$lt':
						return this.formatCondition(queryProperty, '<', mvValue);
					case '$lte':
						return this.formatCondition(queryProperty, '<=', mvValue);
					case '$ne':
						return this.formatCondition(queryProperty, '#', mvValue);
					case '$contains':
						return this.formatCondition(queryProperty, 'like', `...${mvValue}...`);
					case '$startsWith':
						return this.formatCondition(queryProperty, 'like', `${mvValue}...`);
					case '$endsWith':
						return this.formatCondition(queryProperty, 'like', `...${mvValue}`);
					case '$in':
						return this.formatConditionList(queryProperty, '=', mvValue, 'or');
					case '$nin':
						return this.formatConditionList(queryProperty, '#', mvValue, 'and');
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
	private formatSortCriteria = (criteria?: SortCriteria): string | null => {
		if (criteria == null || criteria.length === 0) {
			return null;
		}

		return criteria
			.map((sortEntry) => {
				// if the caller did not pass in a property/order pair as an array default to an ascending sort
				const [sortProperty, sortOrder] = Array.isArray(sortEntry) ? sortEntry : [sortEntry, 1];
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
	};

	/** Format a conditional expression */
	private formatCondition(property: string, operator: string, value: unknown): string {
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
		valueList: unknown[],
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
	private getDictionaryId = (property: string): string => {
		const dictionaryId = this.Model.schema?.dictPaths[property];
		if (dictionaryId == null) {
			throw new InvalidParameterError({
				message: 'Nonexistent schema property or property does not have a dictionary specified',
				parameterName: 'property',
			});
		}
		return dictionaryId;
	};

	/** Transform query constant to internal u2 format (if applicable) */
	private transformToQuery(property: string, constant: unknown): unknown {
		const schemaType = this.Model.schema?.paths[property];
		if (schemaType == null) {
			return constant;
		}

		return schemaType instanceof BaseScalarType || schemaType instanceof BaseScalarArrayType
			? schemaType.transformToQuery(constant)
			: constant;
	}
}

export default Query;
