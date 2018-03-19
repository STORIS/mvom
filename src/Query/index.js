import isPlainObject from 'lodash/isPlainObject';
import InvalidParameterError from 'Errors/InvalidParameter';

/**
 * A query object
 * @param {Model} Model - Model constructor to use with query
 * @param {Object} [selectionCriteria = {}] - Selection criteria object
 * @param {Object} [options = {}]
 * @param {number} [options.skip = 0] - Skip this number of items in the result set
 * @param {number} [options.limit = null] - Limit the result set to this number of items
 * @param {Object} [options.sort = {}] - Object keys defining sort criteria; value of 1 indicates ascending and -1 indicates descending
 * @throws {TypeError} (indirect) The value of the $or property must be an array
 * @throws {TypeError} (indirect) Invalid conditional operator specified
 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
 */
class Query {
	/* static methods */

	/**
	 * Format a conditional expression
	 * @function formatCondition
	 * @memberof Query
	 * @static
	 * @private
	 * @param {string} dictionaryId - Multivalue dictionary to use in expression
	 * @param {string} operator - Relational operator to use in expression
	 * @param {string} value - Constant value to use in expression
	 * @returns {string} Formatted conditional expression
	 * @throws {Error} (indirect) Passed constant parameter contains both single and double quotes
	 */
	static formatCondition = (dictionaryId, operator, value) =>
		`${dictionaryId} ${operator} ${Query.formatConstant(value)}`;

	/**
	 * Format a list of conditional expressions
	 * @function formatConditionList
	 * @memberof Query
	 * @static
	 * @private
	 * @param {string} dictionaryId - Multivalue dictionary to use in expression
	 * @param {string} operator - Relational operator to use in expression
	 * @param {string[]} valueList - Array of constant values to use in expressions
	 * @param {string} joinString - String to join conditional expressions with
	 * @returns {string} Formatted group of joined conditional expressions
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	static formatConditionList = (dictionaryId, operator, valueList, joinString) => {
		if (!Array.isArray(valueList)) {
			throw new InvalidParameterError({ parameterName: 'valueList' });
		}

		const conditionList = valueList.map(value =>
			Query.formatCondition(dictionaryId, operator, value),
		);

		return conditionList.length === 1
			? conditionList[0]
			: `(${conditionList.join(` ${joinString} `)})`;
	};

	/**
	 * Format a constant for use in queries
	 * @function formatConstant
	 * @memberof Query
	 * @static
	 * @private
	 * @param {string} constant - Constant value to format
	 * @returns {string} Constant value enclosed in appropriate quotation marks
	 * @throws {Error} Passed constant parameter contains both single and double quotes
	 */
	static formatConstant = constant => {
		if (constant.includes(`'`) && constant.includes(`"`)) {
			// cannot query if string has both single and double quotes in it
			throw new Error('Query constants cannot contain both single and double quotes');
		}

		let quoteCharacter;
		if (constant.includes(`"`)) {
			quoteCharacter = `'`;
		} else {
			quoteCharacter = `"`;
		}

		return `${quoteCharacter}${constant}${quoteCharacter}`;
	};

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
	 * @returns {Model[]} Array of model instances
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

		return data.result.map(record => new this._Model(record));
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
	 * @param {Object} [criteria = {}] - Object keys defining sort criteria; value of 1 indicates ascending and -1 indicates descending
	 * @modifies {this._sortCriteria}
	 */
	sort = (criteria = {}) => {
		this._sortCriteria = this._formatSortCriteria(criteria);
	};

	/* private instance methods */

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

		const andConditions = Object.keys(criteria).map(queryProperty => {
			const queryValue = criteria[queryProperty];

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

			const dictionaryId = this._getDictionaryId(queryProperty);

			if (!isPlainObject(queryValue)) {
				// assume equality if not an object
				return Query.formatCondition(dictionaryId, '=', queryValue);
			}

			// if query value is an object then it should contain one or more pairs of operator and value
			const operatorConditions = Object.keys(queryValue).map(operator => {
				const mvValue = queryValue[operator];
				switch (operator) {
					case '$eq':
						return Query.formatCondition(dictionaryId, '=', mvValue);
					case '$gt':
						return Query.formatCondition(dictionaryId, '>', mvValue);
					case '$gte':
						return Query.formatCondition(dictionaryId, '>=', mvValue);
					case '$lt':
						return Query.formatCondition(dictionaryId, '<', mvValue);
					case '$lte':
						return Query.formatCondition(dictionaryId, '<=', mvValue);
					case '$ne':
						return Query.formatCondition(dictionaryId, '#', mvValue);
					case '$contains':
						return Query.formatCondition(dictionaryId, 'like', `...${mvValue}...`);
					case '$startsWith':
						return Query.formatCondition(dictionaryId, 'like', `${mvValue}...`);
					case '$endsWith':
						return Query.formatCondition(dictionaryId, 'like', `...${mvValue}`);
					case '$in':
						return Query.formatConditionList(dictionaryId, '=', mvValue, 'or');
					case '$nin':
						return Query.formatConditionList(dictionaryId, '#', mvValue, 'and');
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
	 * @param {Object} [criteria = {}] - Sort criteria object
	 * @returns {string|null} String to use as sort criteria in query
	 * @throws {InvalidParameterError} (indirect) Nonexistent schema property or property does not have a dictionary specified
	 */
	_formatSortCriteria = (criteria = {}) => {
		const criteriaProperties = Object.keys(criteria);
		if (criteriaProperties.length === 0) {
			return null;
		}

		return Object.keys(criteria)
			.map(sortProperty => {
				const sortOrder = criteria[sortProperty];
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
	 * Set options passed via constructor
	 * @function _setOptions
	 * @memberof Query
	 * @instance
	 * @private
	 * @param {Object} [options = {}]
	 * @param {number} [options.skip = 0] - Skip this number of items in the result set
	 * @param {number} [options.limit = null] - Limit the result set to this number of items
	 * @param {Object} [options.sort = {}] - Object keys defining sort criteria; value of 1 indicates ascending and -1 indicates descending
	 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
	 */
	_setOptions = ({ limit, skip, sort } = {}) => {
		this.limit(limit);
		this.skip(skip);
		this.sort(sort);
	};
}

export default Query;
