import cloneDeep from 'lodash/cloneDeep';
import setIn from 'lodash/set';
import toPath from 'lodash/toPath';
import BaseType from 'schemaType/BaseType';
import getFromMvArray from 'shared/getFromMvArray';
import DisallowDirectError from 'Errors/DisallowDirect';
import InvalidParameterError from 'Errors/InvalidParameter';

/**
 * A Simple Schema Type
 * @extends BaseType
 * @hideconstructor
 * @interface
 * @param {Object} definition - Data definition
 * @param {string} [definition.path = null] - 1-indexed String path
 * @throws {DisallowDirectError} Class cannot be instantiated directly
 * @throws {InvalidParameterError} Path definition must be a string of integers split by periods
 */
class SimpleType extends BaseType {
	constructor(definition) {
		/**
		 * 0-indexed Array path
		 * @member {Number[]} path
		 * @memberof SimpleType
		 * @instance
		 */

		if (new.target === SimpleType) {
			// disallow direct instantiation
			throw new DisallowDirectError({ className: 'SimpleType' });
		}

		super();
		const { dictionary = null, path = null } = definition;
		this._normalizeMvPath(path);

		/**
		 * Multivalue dictionary id
		 * @member {string} dictionary
		 * @memberof SimpleType
		 * @instance
		 */
		this.dictionary = dictionary;
	}

	/* public instance methods */

	/**
	 * Get value from mv data
	 * @function get
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} record - Data to get value from
	 * @returns {*} Formatted data value
	 * @throws {TransformDataError} (indirect) Database value could not be transformed to external format
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
	getFromMvData = record => getFromMvArray(record, this.path);

	/**
	 * Transform into multivalue format and set specified value into mv record
	 * @function set
	 * @memberof SimpleType
	 * @instance
	 * @param {*[]} originalRecord - Record structure to use as basis for applied changes
	 * @param {*} setValue - Value to transform and set into record
	 * @returns {*[]} Array data of output record format
	 * @throws {TypeError} (indirect) Could not cast value to number
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
		if (this.path == null) {
			return originalRecord;
		}

		return setIn(cloneDeep(originalRecord), this.path, setValue);
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
	 * @throws {InvalidParameterError} Path definition must be a string of integers split by periods
	 */
	_normalizeMvPath = path => {
		if (path == null) {
			this.path = null;
			return;
		}

		this.path = toPath(path).map(val => {
			const numVal = +val;
			if (!Number.isInteger(numVal) || numVal < 1) {
				throw new InvalidParameterError({
					message: 'Path definition must be a string of integers split by periods',
					parameterName: 'path',
				});
			}
			return numVal - 1;
		});
	};
}

export default SimpleType;
