import isObject from 'lodash/isObject';
import toPath from 'lodash/toPath';

/**
 * A schema object
 * @param {Object} definition - A schema definition object
 * @example const example = new Schema({ propertyA: [{ property1: { path: '1'} }] })
 */
class Schema {
	/**
	 * Determine if an object matches the structure of a data definition
	 * @function isDataDefinition
	 * @memberof Schema
	 * @static
	 * @private
	 * @param {Object} obj - Object to test
	 * @returns {Boolean} True if object is a data definition; false otherwise
	 */
	static isDataDefinition = obj => Object.prototype.hasOwnProperty.call(obj, 'path');

	/**
	 * Convert a 1-index string array path definition (e.g. '1.1.1') to a 0-index array path definition (e.g. [0, 0, 0])
	 * @function normalizeMvPath
	 * @memberof Schema
	 * @static
	 * @private
	 * @param {string} path - 1-indexed String path
	 * @returns {number[]} 0-indexed Array path
	 */
	static normalizeMvPath = path =>
		toPath(path).map(val => {
			const numVal = +val;
			if (!Number.isInteger(numVal) || numVal < 1) {
				throw new Error();
			}
			return numVal - 1;
		});

	constructor(definition) {
		this.definition = definition;
		this.paths = {};
		this._buildPaths();
	}

	/**
	 * Construct instance member paths
	 * @function _buildPaths
	 * @memberof Schema
	 * @instance
	 * @private
	 * @throws {Error}
	 */
	_buildPaths = () => {
		/**
		 * Flatten nested schemas
		 * @function flatten
		 * @inner
		 * @private
		 * @param {Object} obj - Object to be flattened
		 * @param {string} prev - Previous keypath generated from earlier recursive iterations of flatten
		 * @returns {Object} Flattened object structure with keys as keypath (e.g. 'foo.bar.baz') strings
		 */
		const flatten = (obj, prev) => {
			Object.keys(obj).forEach(key => {
				const value = obj[key];
				const newKey = prev != null ? `${prev}.${key}` : key;

				if (Array.isArray(value)) {
					// handle arrays
					const arrayValue = value[0];
					if (value.length !== 1 || !isObject(arrayValue)) {
						// a schema array definition must contain exactly one value of language-type object (which includes arrays)
						throw new Error();
					}

					if (Array.isArray(arrayValue)) {
						const nestedArrayValue = arrayValue[0];
						if (!Schema.isDataDefinition(nestedArrayValue)) {
							// a nested array can only be of data definitions
							throw new Error();
						}
						// the array contains an array which contains a data definition; normalize the multivalue path and set as result
						nestedArrayValue.path = Schema.normalizeMvPath(nestedArrayValue.path);
						this.paths[newKey] = [[nestedArrayValue]];
						return;
					}

					if (arrayValue instanceof Schema) {
						// this array contains already compiled schema; set path as an array of this Schema
						this.paths[newKey] = [arrayValue];
						return;
					}

					if (Schema.isDataDefinition(arrayValue)) {
						// the array appears to contain a data definition; normalize the multivalue path and set path as array of result
						arrayValue.path = Schema.normalizeMvPath(arrayValue.path);
						this.paths[newKey] = [arrayValue];
						return;
					}

					// any other object is treated as an uncompiled subdocument schema; compile and set path as array of result
					const subDocumentSchema = new Schema(arrayValue);
					this.paths[newKey] = [subDocumentSchema];
					return;
				}

				if (isObject(value)) {
					// handle objects
					if (value instanceof Schema) {
						// this is already compiled schema; set path as is
						this.paths[newKey] = value;
						return;
					}

					if (Schema.isDataDefinition(value)) {
						// this appears to be a data definition; normalize the multivalue path and set path as result
						value.path = Schema.normalizeMvPath(value.path);
						this.paths[newKey] = value;
						return;
					}

					// this is an object but does not represent a valid data definition; need to recursively process it
					flatten(value, newKey);
					return;
				}

				// this property does not have a valid structure
				throw new Error();
			});
		};

		flatten(this.definition);
	};
}

export default Schema;
