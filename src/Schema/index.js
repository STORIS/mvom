import isObject from 'lodash/isObject';
import schemaType from 'schemaType';

/**
 * A schema object
 * @param {Object} definition - A schema definition object
 * @param {Object} options
 * @param {string} [options.typeProperty = "type"] The name of the property to use for data typing
 * @example const example = new Schema({ propertyA: [{ property1: { path: '1'} }] })
 */
class Schema {
	constructor(definition, { typeProperty = 'type' } = {}) {
		/**
		 * @member {Object} _definition - The schema definition passed to the constructor
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._definition = definition;
		/**
		 * @member {string} _typeProperty - The name of the property to use for data typing
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._typeProperty = typeProperty;
		/**
		 * @member {Object} paths - The compiled schema object path stucture
		 * @memberof Schema
		 * @instance
		 */
		this.paths = {};

		this._buildPaths();
	}

	/* private instance methods */

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
						if (!this._isDataDefinition(nestedArrayValue)) {
							// a nested array can only be of data definitions
							throw new Error();
						}
						// the array contains an array which contains a data definition; cast the definition to the appropriate type
						this.paths[newKey] = [[this._castDefinition(nestedArrayValue)]];
						return;
					}

					if (arrayValue instanceof Schema) {
						// this array contains already compiled schema; set path as an array of this Schema
						this.paths[newKey] = [arrayValue];
						return;
					}

					if (this._isDataDefinition(arrayValue)) {
						// the array appears to contain a data definition; cast the definition to the appropriate type
						this.paths[newKey] = [this._castDefinition(arrayValue)];
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

					if (this._isDataDefinition(value)) {
						// this appears to be a data definition; cast the definition to the appropriate type
						this.paths[newKey] = this._castDefinition(value);
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

		flatten(this._definition);
	};

	/**
	 * @function _castDefinition
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Object} dataDefinition - Schema data definition
	 * @returns Instance of schemaType class as defined by definition
	 * @throws {Error}
	 */
	_castDefinition = dataDefinition => {
		if (!this._isDataDefinition(dataDefinition)) {
			throw new Error();
		}
		switch (dataDefinition[this._typeProperty]) {
			case Boolean:
			case schemaType.Boolean:
				return new schemaType.Boolean(dataDefinition);
			case schemaType.ISOCalendarDateTime:
				return new schemaType.ISOCalendarDateTime(dataDefinition);
			case schemaType.ISOCalendarDate:
				return new schemaType.ISOCalendarDate(dataDefinition);
			case schemaType.ISOTime:
				return new schemaType.ISOTime(dataDefinition);
			case Number:
			case schemaType.Number:
				return new schemaType.Number(dataDefinition);
			case String:
			case schemaType.String:
				return new schemaType.String(dataDefinition);
			default:
				throw new Error();
		}
	};

	/**
	 * Determine if an object matches the structure of a data definition
	 * @function _isDataDefinition
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Object} obj - Object to test
	 * @returns {Boolean} True if object is a data definition; false otherwise
	 */
	_isDataDefinition = obj => Object.prototype.hasOwnProperty.call(obj, this._typeProperty);
}

export default Schema;
