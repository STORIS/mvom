import castArray from 'lodash/castArray';
import toPath from 'lodash/toPath';
import BaseType from 'schemaType/BaseType';

/**
 * A Simple Schema Type
 * @extends BaseType
 * @hideconstructor
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 * @throws {Error}
 */
class SimpleType extends BaseType {
	constructor(definition) {
		/**
		 * 0-indexed Array path
		 * @member {Array} _path
		 * @memberof SimpleType
		 * @instance
		 * @private
		 */

		if (new.target === SimpleType) {
			// disallow direct instantiation
			throw new Error();
		}

		super();
		const { path = null } = definition;
		this._normalizeMvPath(path);
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Formatted data value
	 */
	get = record => {
		const processEach = value => {
			if (Array.isArray(value)) {
				return value.map(arrayVal => processEach(arrayVal));
			}
			return this.transformFromDb(value);
		};

		return processEach(this._getFromMvData(record));
	};

	/* private instance methods */

	/**
	 * Get data from the specified keypath
	 * @function _getFromMvData
	 * @memberof SimpleType
	 * @instance
	 * @private
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Value of data at specified location
	 */
	_getFromMvData = record => {
		if (this._path == null) {
			return null;
		}
		return this._path.reduce((acc, pathPart) => castArray(acc)[pathPart], record);
	};

	/**
	 * Convert a 1-index string array path definition (e.g. '1.1.1') to a 0-index array path definition (e.g. [0, 0, 0])
	 * @function _normalizeMvPath
	 * @memberof SimpleType
	 * @instance
	 * @private
	 * @param {string} [path] - 1-indexed String path
	 * @returns {number[]} 0-indexed Array path
	 */
	_normalizeMvPath = path => {
		if (path == null) {
			this._path = null;
			return;
		}

		this._path = toPath(path).map(val => {
			const numVal = +val;
			if (!Number.isInteger(numVal) || numVal < 1) {
				throw new Error();
			}
			return numVal - 1;
		});
	};
}

export default SimpleType;
