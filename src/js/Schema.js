import { isObject, isPlainObject } from 'lodash';
import * as schemaType from '#sharedjs/schemaType';
import { InvalidParameterError } from '#shared/errors';

const {
	ArrayType,
	BooleanType,
	DocumentArrayType,
	EmbeddedType,
	ISOCalendarDateTimeType,
	ISOCalendarDateType,
	ISOTimeType,
	NestedArrayType,
	NumberType,
	StringType,
} = schemaType;

/**
 * A schema object
 * @param {Object} definition - A schema definition object
 * @param {Object} [options = {}]
 * @param {string} [options.typeProperty = "type"] The name of the property to use for data typing
 * @param {Object} [options.dictionaries = {}] Additional dictionaries for use in query (key/value paired)
 * @param {RegExp} [options.idMatch] Regular expression to validate the record id against
 * @param {Object} [options.idForeignKey] Foreign key definition for the record id
 * @param {Function} [options.encrypt] Encryption function to use to encrypt sensitive fields
 * @param {Function} [options.decrypt] Decryption function to use to decrypt sensitive fields
 * @example const example = new Schema({ propertyA: [{ property1: { path: '1'} }] })
 * @throws {InvalidParameterError} An invalid parameter was passed to the function
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
		ISOCalendarDateTime: ISOCalendarDateTimeType,
		ISOCalendarDate: ISOCalendarDateType,
		ISOTime: ISOTimeType,
	};

	constructor(
		definition,
		{ typeProperty = 'type', dictionaries = {}, idForeignKey, idMatch, encrypt, decrypt } = {},
	) {
		if (!isPlainObject(definition)) {
			throw new InvalidParameterError({ parameterName: 'definition' });
		}
		if (!isPlainObject(dictionaries)) {
			throw new InvalidParameterError({ parameterName: 'dictionaries' });
		}
		if (idForeignKey != null && !isPlainObject(idForeignKey)) {
			throw new InvalidParameterError({ parameterName: 'idForeignKey' });
		}
		if (idMatch != null && !(idMatch instanceof RegExp)) {
			throw new InvalidParameterError({ parameterName: 'idMatch' });
		}
		if (encrypt != null && typeof encrypt !== 'function') {
			throw new InvalidParameterError({ parameterName: 'encrypt' });
		}
		if (decrypt != null && typeof decrypt !== 'function') {
			throw new InvalidParameterError({ parameterName: 'decrypt' });
		}
		/**
		 * Key/value pairs of schema object path structure and associated multivalue dictionary ids
		 * @member {Object} dictPaths
		 * @memberof Schema
		 * @instance
		 */
		this.dictPaths = { _id: '@ID', ...dictionaries };
		/**
		 * The compiled schema object path structure
		 * @member {Object} paths
		 * @memberof Schema
		 * @instance
		 */
		this.paths = {};
		/**
		 * Foreign key definition for the record id
		 * @member {Object} idForeignKey
		 * @memberof Schema
		 * @instance
		 */
		this.idForeignKey = idForeignKey;
		/**
		 * Regular expression to validate the record id against
		 * @member {string} idMatch
		 * @memberof Schema
		 * @instance
		 */
		this.idMatch = idMatch;
		/**
		 * The schema definition passed to the constructor
		 * @member {Object} _definition
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._definition = definition;
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
		/**
		 * The name of the property to use for data typing
		 * @member {string} _typeProperty
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._typeProperty = typeProperty;
		/**
		 * Optional function to use for encryption of sensitive data
		 * @member {function} _encrypt
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._encrypt = encrypt;
		/**
		 * Optional function to use for decryption of sensitive data
		 * @member {function} _decrypt
		 * @memberof Schema
		 * @instance
		 * @private
		 */
		this._decrypt = decrypt;

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
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	_buildPaths = (definition, prev) => {
		Object.entries(definition).forEach(([key, value]) => {
			if (!isObject(value)) {
				// all property values must either be an object or an array (which is a language type of object)
				throw new InvalidParameterError({ parameterName: 'definition' });
			}

			// construct flattened keypath
			const newKey = prev != null ? `${prev}.${key}` : key;

			if (Array.isArray(value)) {
				// cast this value as an array
				this.paths[newKey] = this._castArray(value, newKey);
				return;
			}

			if (this._isDataDefinition(value)) {
				// cast this value as a schemaType
				this.paths[newKey] = this._castDefinition(value, newKey);
				return;
			}

			if (value instanceof Schema) {
				// value is an already compiled schema - cast as embedded document
				this._handleSubDocumentSchemas(value, newKey);
				this.paths[newKey] = new EmbeddedType(value);
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
	 * @param {string[]} keyPath - Key path of property that array is being cast against
	 * @returns Instance of schemaType class as defined by definition
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	_castArray = (castee, keyPath) => {
		if (!Array.isArray(castee)) {
			throw new InvalidParameterError({
				message: 'castee parameter must be an array',
				parameterName: 'castee',
			});
		}

		const arrayValue = castee[0];
		if (castee.length !== 1 || !isObject(arrayValue)) {
			// a schema array definition must contain exactly one value of language-type object (which includes arrays)
			throw new InvalidParameterError({
				message: 'castee parameter must be an array containing a single object',
				parameterName: 'castee',
			});
		}

		if (Array.isArray(arrayValue)) {
			const nestedArrayValue = arrayValue[0];
			if (!this._isDataDefinition(nestedArrayValue)) {
				// a nested array can only be of data definitions
				throw new InvalidParameterError({
					message: 'Nested arrays may only contain data definitions',
					parameterName: 'castee',
				});
			}
			return new NestedArrayType(this._castDefinition(nestedArrayValue, keyPath));
		}

		if (arrayValue instanceof Schema) {
			this._handleSubDocumentSchemas(arrayValue, keyPath);
			return new DocumentArrayType(arrayValue);
		}

		if (this._isDataDefinition(arrayValue)) {
			return new ArrayType(this._castDefinition(arrayValue, keyPath));
		}

		const subdocumentSchema = new Schema(arrayValue, {
			type: this._typeProperty,
			encrypt: this._encrypt,
			decrypt: this._decrypt,
		});
		this._handleSubDocumentSchemas(subdocumentSchema, keyPath);
		return new DocumentArrayType(subdocumentSchema);
	};

	/**
	 * Cast a data definition to a schemaType
	 * @function _castDefinition
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Object} castee - Object to cast to a schemaType
	 * @param {string[]} keyPath - Key path of property that definition is being cast against
	 * @modifies {this._mvPaths}
	 * @modifies {this.dictPaths}
	 * @returns Instance of schemaType class as defined by definition
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	_castDefinition = (castee, keyPath) => {
		if (!this._isDataDefinition(castee)) {
			throw new InvalidParameterError({
				message: 'castee parameter must be a data definition',
				parameterName: 'castee',
			});
		}

		const options = { encrypt: this._encrypt, decrypt: this._decrypt };
		let schemaTypeValue;
		switch (castee[this._typeProperty]) {
			case Boolean:
				schemaTypeValue = new BooleanType(castee);
				break;
			case ISOCalendarDateTimeType:
				schemaTypeValue = new ISOCalendarDateTimeType(castee);
				break;
			case ISOCalendarDateType:
				schemaTypeValue = new ISOCalendarDateType(castee, options);
				break;
			case ISOTimeType:
				schemaTypeValue = new ISOTimeType(castee);
				break;
			case Number:
				schemaTypeValue = new NumberType(castee);
				break;
			case String:
				schemaTypeValue = new StringType(castee, options);
				break;
			default:
				throw new InvalidParameterError({
					message: 'Data definition does not contain a supported type value',
					parameterName: 'castee',
				});
		}

		// add to mvPath array
		if (schemaTypeValue.path != null) {
			this._mvPaths.push(schemaTypeValue.path);
		}

		// update dictPaths
		if (schemaTypeValue.dictionary != null) {
			this.dictPaths[keyPath] = schemaTypeValue.dictionary;
		}

		return schemaTypeValue;
	};

	/**
	 * Perform ancillary updates needed when a subdocument is in the Schema definition
	 * @function _handleSubDocumentSchemas
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Schema} schema - Subdocument schema
	 * @param {string} keyPath - keyPath string that locates the subdocument in the parent Schema
	 * @modifies {this._subdocumentSchemas}
	 */
	_handleSubDocumentSchemas = (schema, keyPath) => {
		this._subdocumentSchemas.push(schema);
		this._mergeSchemaDictionaries(schema, keyPath);
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
	_isDataDefinition = (obj) =>
		Object.prototype.hasOwnProperty.call(obj, this._typeProperty) &&
		Object.prototype.hasOwnProperty.call(obj, 'path');

	/**
	 * Merge subdocument schema dictionaries with the parent schema's dictionaries
	 * @function _mergeSchemaDictionaries
	 * @memberof Schema
	 * @instance
	 * @private
	 * @param {Schema} schema - Subdocument schema
	 * @param {string} keyPath - keyPath string that locates the subdocument in the parent Schema
	 * @modifies {this.dictPaths}
	 */
	_mergeSchemaDictionaries = (schema, keyPath) => {
		this.dictPaths = Object.entries(schema.dictPaths).reduce((acc, [subDictPath, subDictId]) => {
			const dictKey = `${keyPath}.${subDictPath}`;
			return {
				...acc,
				[dictKey]: subDictId,
			};
		}, this.dictPaths);
	};
}

export default Schema;
