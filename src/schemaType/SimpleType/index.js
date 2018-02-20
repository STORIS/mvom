import castArray from 'lodash/castArray';
import cloneDeep from 'lodash/cloneDeep';
import setIn from 'lodash/set';
import toPath from 'lodash/toPath';
import BaseType from 'schemaType/BaseType';

/**
 * A Simple Schema Type
 * @extends BaseType
 * @hideconstructor
 * @interface
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
		const value = this.getFromMvData(record);
		return this.transformFromDb(value);
	};

	/**
	 * Get data from the specified keypath
	 * @function getFromMvData
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Value of data at specified location
	 */
	getFromMvData = record => {
		if (this._path == null) {
			return null;
		}
		// lodash.get will not work here because "array" data might be returned from multi-value that still
		// appears like a non-array; if that happens, lodash.get would return the character at that string position instead;
		// this reducer ensures that the appropriate value is retrieved.
		return this._path.reduce((acc, pathPart) => castArray(acc)[pathPart], record);
	};

	/**
	 * Transform into multivalue format and set specified value into mv record
	 * @function set
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to transform and set into record
	 * @returns {*[]} Array data of output record format
	 */
	set = (originalRecord, setValue) =>
		this.setIntoMvData(originalRecord, this.transformToDb(setValue));

	/**
	 * Set specified value into mv record
	 * @function set
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to set into record
	 * @returns {*[]} Array data of output record format
	 */
	setIntoMvData = (originalRecord, setValue) => {
		if (this._path == null) {
			return originalRecord;
		}

		return setIn(cloneDeep(originalRecord), this._path, setValue);
	};

	/* private instance methods */

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
