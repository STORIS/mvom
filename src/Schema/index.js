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
	/**
	 * Additional schema types
	 * @member {Object} Types
	 * @memberof Schema
	 * @property {ISOCalendarDateTimeType} ISOCalendarDateTime - Class definition for ISO 8601 String representation of calendar date and time
	 * @property {ISOCalendarDateType} ISOCalendarDate - Class definition for ISO 8601 String representation of calendar date
	 * @property {ISOTimeType} ISOTime - Class definition for ISO 8601 String representation of time
	 * @static
	 */
	static Types = {
		ISOCalendarDateTime: schemaType.ISOCalendarDateTime,
		ISOCalendarDate: schemaType.ISOCalendarDate,
		ISOTime: schemaType.ISOTime,
	};

	constructor(definition, { typeProperty = 'type' } = {}) {
		/**
		 * The schema definition passed to the constructor
		 * @member {Object} _definition
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._definition = definition;
		/**
		 * The name of the property to use for data typing
		 * @member {string} _typeProperty
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._typeProperty = typeProperty;
		/**
		 * The compiled schema object path stucture
		 * @member {Object} paths
		 * @memberof Schema
		 * @instance
		 */
		this.paths = {};
		/**
		 * Array of all multivalue data paths represented in the Schema
		 * @member {Number[]} _mvPaths
		 * @memberof Schema
		 * @instance
		 */
		this._mvPaths = [];
		/**
		 * Array of all subdocument schemas represented in this Schema
		 * @member {Schema[]} _subdocumentSchemas
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._subdocumentSchemas = [];

		this._buildPaths(this._definition);
	}

	/* public instance methods */

	/**
	 * Get all multivalue data paths in this schema and its subdocument schemas
	 * @function getMvPaths
	 * @memberof Schema
	 * @instance
	 * @returns {Number[]} Array of all multivalue data paths represented in the Schema and any subdocument schemas
	 */
	getMvPaths = () =>
		this._subdocumentSchemas.reduce(
			(mvPaths, schema) => mvPaths.concat(schema.getMvPaths()),
			this._mvPaths.slice(),
		);

	/* private instance methods */

	/**
	 * Construct instance member paths
	 * @function _buildPaths
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Object} definition - Schema definition to be flattened
	 * @param {string} [prev] - Previous keypath generated from earlier recursive iterations of _buildPaths
	 * @throws {Error}
	 */
	_buildPaths = (definition, prev) => {
		Object.keys(definition).forEach(key => {
			const value = definition[key];
			if (!isObject(value)) {
				// all property values must either be an object or an array (which is a language type of object)
				throw new Error();
			}

			// construct flattened keypath
			const newKey = prev != null ? `${prev}.${key}` : key;

			if (Array.isArray(value)) {
				// cast this value as an array
				this.paths[newKey] = this._castArray(value);
				return;
			}

			if (this._isDataDefinition(value)) {
				// cast this value as a schemaType
				this.paths[newKey] = this._castDefinition(value);
				return;
			}

			if (value instanceof Schema) {
				// value is an already compiled schema - cast as embedded document
				this.paths[newKey] = new schemaType.Embedded(value);
				this._subdocumentSchemas.push(value);
				return;
			}

			// this is an object but does not represent something which could be cast; need to recursively process it
			this._buildPaths(value, newKey);
		});
	};

	/**
	 * Cast an array to a schemaType
	 * @function _castArray
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Array} castee - Array to cast to a schemaType
	 * @returns Instance of schemaType class as defined by definition
	 * @throws {Error}
	 */
	_castArray = castee => {
		if (!Array.isArray(castee)) {
			throw new Error();
		}

		const arrayValue = castee[0];
		if (castee.length !== 1 || !isObject(arrayValue)) {
			// a schema array definition must contain exactly one value of language-type object (which includes arrays)
			throw new Error();
		}

		if (Array.isArray(arrayValue)) {
			const nestedArrayValue = arrayValue[0];
			if (!this._isDataDefinition(nestedArrayValue)) {
				// a nested array can only be of data definitions
				throw new Error();
			}
			return new schemaType.NestedArray(this._castDefinition(nestedArrayValue));
		}

		if (arrayValue instanceof Schema) {
			this._subdocumentSchemas.push(arrayValue);
			return new schemaType.DocumentArray(arrayValue);
		}

		if (this._isDataDefinition(arrayValue)) {
			return new schemaType.Array(this._castDefinition(arrayValue));
		}

		const subdocumentSchema = new Schema(arrayValue, { type: this._typeProperty });
		this._subdocumentSchemas.push(subdocumentSchema);
		return new schemaType.DocumentArray(subdocumentSchema);
	};

	/**
	 * Cast a data definition to a schemaType
	 * @function _castDefinition
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Object} castee - Object to cast to a schemaType
	 * @returns Instance of schemaType class as defined by definition
	 * @throws {Error}
	 */
	_castDefinition = castee => {
		if (!this._isDataDefinition(castee)) {
			throw new Error();
		}

		let schemaTypeValue;
		switch (castee[this._typeProperty]) {
			case Boolean:
				schemaTypeValue = new schemaType.Boolean(castee);
				break;
			case schemaType.ISOCalendarDateTime:
				schemaTypeValue = new schemaType.ISOCalendarDateTime(castee);
				break;
			case schemaType.ISOCalendarDate:
				schemaTypeValue = new schemaType.ISOCalendarDate(castee);
				break;
			case schemaType.ISOTime:
				schemaTypeValue = new schemaType.ISOTime(castee);
				break;
			case Number:
				schemaTypeValue = new schemaType.Number(castee);
				break;
			case String:
				schemaTypeValue = new schemaType.String(castee);
				break;
			default:
				throw new Error();
		}

		if (schemaTypeValue.path != null) {
			this._mvPaths.push(schemaTypeValue.path);
		}

		return schemaTypeValue;
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
