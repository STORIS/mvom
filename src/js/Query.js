import { isPlainObject } from 'lodash';
import { InvalidParameterError } from '#shared/errors';

/**
 * A query object
 * @param {Model} Model - Model constructor to use with query
 * @param {Object} [selectionCriteria = {}] - Selection criteria object
 * @param {Object} [options = {}]
 * @param {number} [options.skip = 0] - Skip this number of items in the result set
 * @param {number} [options.limit = null] - Limit the result set to this number of items
 * @param {SortCriteria} [options.sort = []] - List of field/direction nested arrays defining sort criteria
 * @throws {TypeError} (indirect) The value of the $or property must be an array
 * @throws {TypeError} (indirect) Invalid conditional operator specified
 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
 */
class Query {
	constructor(Model, selectionCriteria = {}, options = {}) {
		/**
		 * Model constructor to use with query
		 * @member {Model} _Model
		 * @memberof Query
		 * @instance
		 * @private
		 */
		this._Model = Model;
		/**
		 * Limit the result set to this number of items
		 * @member {number|null}  _limit
		 * @memberof Query
		 * @instance
		 * @private
		 */
		this._limit = null;
		/**
		 * String to use as selection criteria in query
		 * @member {string} _selectionCriteria
		 * @memberof Query
		 * @instance
		 * @private
		 */
		this._selectionCriteria = null;
		/**
		 * Skip this number of items in the result set
		 * @member {number} _skip
		 * @memberof Query
		 * @instance
		 * @private
		 */
		this._skip = null;
		/**
		 * String to use as sort criteria in query
		 * @member {string} _sortCriteria
		 * @memberof Query
		 * @instance
		 * @private
		 */
		this._sortCriteria = null;

		this.selection(selectionCriteria);
		this._setOptions(options);
	}

	/* public instance methods */

	/**
	 * Execute query
	 * @function exec
	 * @memberof Query
	 * @instance
	 * @async
	 * @returns {Promise.<ResultsObject>} Query results object
	 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
	 * @throws {DbServerError} (indirect) An error occurred on the database server
	 */
	exec = async () => {
		let queryCommand = `select ${this._Model.file}`;
		if (this._selectionCriteria != null) {
			queryCommand = `${queryCommand} with ${this._selectionCriteria}`;
		}
		if (this._sortCriteria != null) {
			queryCommand = `${queryCommand} ${this._sortCriteria}`;
		}

		const options = {
			filename: this._Model.file,
			queryCommand,
		};

		if (this._skip != null) {
			options.skip = this._skip;
		}

		if (this._limit != null) {
			options.limit = this._limit;
		}

		this._Model.connection.logger.debug(`executing query "${queryCommand}"`);
		const data = await this._Model.connection.executeDbFeature('find', options);

		return {
			count: data.count,
			documents: data.documents.map(dbResultItem =>
				this._Model.makeModelFromDbResult(dbResultItem),
			),
		};
	};

	/**
	 * Set the limit value for query
	 * @function limit
	 * @memberof Query
	 * @instance
	 * @param {number|null} [value = null] - Number of items to limit result set to
	 * @modifies {this._limit}
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	limit = (value = null) => {
		if (value != null && !Number.isInteger(value)) {
			throw new InvalidParameterError({ parameterName: 'value' });
		}
		this._limit = value;
	};

	/**
	 * Set the selection criteria for query
	 * @function selection
	 * @memberof Query
	 * @instance
	 * @param {Object} [criteria = {}] - Selection criteria object
	 * @modifies {this._selectionCriteria}
	 * @throws {TypeError} (indirect) The value of the $or property must be an array
	 * @throws {TypeError} (indirect) Invalid conditional operator specified
	 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
	 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
	 */
	selection = (criteria = {}) => {
		this._selectionCriteria = this._formatSelectionCriteria(criteria);
	};

	/**
	 * Set the skip value for query
	 * @function skip
	 * @memberof Query
	 * @instance
	 * @param {number} [value = 0] - Number of items to skip in result set
	 * @modifies {this._skip}
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	skip = (value = 0) => {
		if (!Number.isInteger(value)) {
			throw new InvalidParameterError({ parameterName: 'value' });
		}
		this._skip = value;
	};

	/**
	 * Set the sort criteria for query
	 * @function sort
	 * @memberof Query
	 * @instance
	 * @param {SortCriteria} [criteria = []] - List of field/direction nested arrays defining sort criteria
	 * @modifies {this._sortCriteria}
	 */
	sort = (criteria = []) => {
		this._sortCriteria = this._formatSortCriteria(criteria);
	};

	/* private instance methods */

	/**
	 * Format a conditional expression
	 * @function _formatCondition
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {string} property - String keypath of property
	 * @param {string} operator - Relational operator to use in expression
	 * @param {string} value - Constant value to use in expression
	 * @returns {string} Formatted conditional expression
	 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
	 */
	_formatCondition = (property, operator, value) => {
		const dictionaryId = this._getDictionaryId(property);
		return `${dictionaryId} ${operator} ${this._formatConstant(property, value)}`;
	};

	/**
	 * Format a list of conditional expressions
	 * @function _formatConditionList
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {string} property - String keypath of property
	 * @param {string} operator - Relational operator to use in expression
	 * @param {string[]} valueList - Array of constant values to use in expressions
	 * @param {string} joinString - String to join conditional expressions with
	 * @returns {string} Formatted group of joined conditional expressions
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	_formatConditionList = (property, operator, valueList, joinString) => {
		if (!Array.isArray(valueList)) {
			throw new InvalidParameterError({ parameterName: 'valueList' });
		}

		const conditionList = valueList.map(value => this._formatCondition(property, operator, value));

		return conditionList.length === 1
			? conditionList[0]
			: `(${conditionList.join(` ${joinString} `)})`;
	};

	/**
	 * Format a constant for use in queries
	 * @function _formatConstant
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {string} property - String keypath of property
	 * @param {string} constant - Constant value to format
	 * @returns {string} Constant value enclosed in appropriate quotation marks
	 * @throws {Error} Passed constant parameter contains both single and double quotes
	 */
	_formatConstant = (property, constant) => {
		let constantToFormat = constant;
		const queryTransformer = this._getQueryTransformer(property);
		if (typeof queryTransformer === 'function') {
			constantToFormat = queryTransformer(constantToFormat);
		}

		if (constantToFormat.includes(`'`) && constantToFormat.includes(`"`)) {
			// cannot query if string has both single and double quotes in it
			throw new Error('Query constants cannot contain both single and double quotes');
		}

		let quoteCharacter;
		if (constantToFormat.includes(`"`)) {
			quoteCharacter = `'`;
		} else {
			quoteCharacter = `"`;
		}

		return `${quoteCharacter}${constantToFormat}${quoteCharacter}`;
	};

	/**
	 * Format the selection criteria object into a string to use in multivalue query
	 * @function _formatSelectionCriteria
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {Object} [criteria = {}] - Selection criteria object
	 * @returns {string|null} String to use as selection criteria in query
	 * @throws {TypeError} The value of the $or property must be an array
	 * @throws {TypeError} Invalid conditional operator specified
	 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
	 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
	 */
	_formatSelectionCriteria = (criteria = {}) => {
		const criteriaProperties = Object.keys(criteria);
		if (criteriaProperties.length === 0) {
			return null;
		}

		const andConditions = Object.entries(criteria).map(([queryProperty, queryValue]) => {
			if (queryProperty === '$or') {
				if (!Array.isArray(queryValue) || queryValue.length === 0) {
					throw new TypeError('The value of the $or property must be an array');
				}

				const orConditions = queryValue.map(queryObj => this._formatSelectionCriteria(queryObj));
				if (orConditions.length === 1) {
					return orConditions[0];
				}

				return `(${orConditions.join(' or ')})`;
			}

			if (Array.isArray(queryValue)) {
				// assume $in operator if queryValue is an array
				return this._formatConditionList(queryProperty, '=', queryValue, 'or');
			}

			if (!isPlainObject(queryValue)) {
				// assume equality if queryValue is not an object
				return this._formatCondition(queryProperty, '=', queryValue);
			}

			// if query value is an object then it should contain one or more pairs of operator and value
			const operatorConditions = Object.entries(queryValue).map(([operator, mvValue]) => {
				switch (operator) {
					case '$eq':
						return this._formatCondition(queryProperty, '=', mvValue);
					case '$gt':
						return this._formatCondition(queryProperty, '>', mvValue);
					case '$gte':
						return this._formatCondition(queryProperty, '>=', mvValue);
					case '$lt':
						return this._formatCondition(queryProperty, '<', mvValue);
					case '$lte':
						return this._formatCondition(queryProperty, '<=', mvValue);
					case '$ne':
						return this._formatCondition(queryProperty, '#', mvValue);
					case '$contains':
						return this._formatCondition(queryProperty, 'like', `...${mvValue}...`);
					case '$startsWith':
						return this._formatCondition(queryProperty, 'like', `${mvValue}...`);
					case '$endsWith':
						return this._formatCondition(queryProperty, 'like', `...${mvValue}`);
					case '$in':
						return this._formatConditionList(queryProperty, '=', mvValue, 'or');
					case '$nin':
						return this._formatConditionList(queryProperty, '#', mvValue, 'and');
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
	};

	/**
	 * Format the sort criteria object into a string to use in multivalue query
	 * @function _formatSortCriteria
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {SortCriteria} [criteria = []] - List of field/direction nested arrays defining sort criteria
	 * @returns {string|null} String to use as sort criteria in query
	 * @throws {InvalidParameterError} (indirect) Nonexistent schema property or property does not have a dictionary specified
	 */
	_formatSortCriteria = (criteria = []) => {
		if (criteria.length === 0) {
			return null;
		}

		return criteria
			.map(sortEntry => {
				// if the caller did not pass in a property/order pair as an array default to an ascending sort
				const [sortProperty, sortOrder] = Array.isArray(sortEntry) ? sortEntry : [sortEntry, 1];
				const dictionaryId = this._getDictionaryId(sortProperty);

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

	/**
	 * Get a dictionary id at a given schema path
	 * @function _getDictionaryId
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {string} property - String keypath to get dictionary id from
	 * @returns {string} Dictionary id located at the specified keypath
	 * @throws {InvalidParameterError} Nonexistent schema property or property does not have a dictionary specified
	 */
	_getDictionaryId = property => {
		const dictionaryId = this._Model.schema.dictPaths[property];
		if (dictionaryId == null) {
			throw new InvalidParameterError({
				message: 'Nonexistent schema property or property does not have a dictionary specified',
				parameterName: 'property',
			});
		}
		return dictionaryId;
	};

	/**
	 * Get the function to convert query constant to internal u2 format (if applicable)
	 * @function _getQueryTransformer
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {string} property - String keypath of property
	 * @returns {Function|undefined} Function to execute to convert query constant to internal u2 format
	 */
	_getQueryTransformer = property =>
		this._Model.schema.paths[property] && this._Model.schema.paths[property].transformToQuery;

	/**
	 * Set options passed via constructor
	 * @function _setOptions
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {Object} [options = {}]
	 * @param {number} [options.skip = 0] - Skip this number of items in the result set
	 * @param {number} [options.limit = null] - Limit the result set to this number of items
	 * @param {Array} [options.sort = []] - List of field/direction nested arrays defining sort criteria. ex: [[foo, 1], [bar, -1]] where value of 1 indicates ascending and -1 indicates descending
	 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
	 */
	_setOptions = ({ limit, skip, sort } = {}) => {
		this.limit(limit);
		this.skip(skip);
		this.sort(sort);
	};
}

export default Query;
