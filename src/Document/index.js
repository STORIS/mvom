import assignIn from 'lodash/assignIn';
import castArray from 'lodash/castArray';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import Schema from 'Schema';

/**
 * A document object
 * @class Document
 * @param {Schema} schema - Schema instance to derive document from
 * @param {*[]} record - Array data to construct document instance properties from
 * @throws {Error}
 */
class Document {
	/* static methods */
	/**
	 * Convert an object containing properties which are arrays to an array of objects
	 * @function objArrayToArrayObj
	 * @memberof Document
	 * @static
	 * @private
	 * @param {Object} obj - Object to convert
	 * @returns {Object[]} Array of objects
	 * @example
	 * // returns [ { propertyA: 'foo' }, { propertyA: 'bar'} ]
	 * Document.objArrayToArrayObj({ propertyA: ['foo', 'bar'] });
	 * @example
	 * // returns [ { propertyA: [{ propertyB: 'foo' }, { propertyB: 'bar' }] }, { propertyA: [{ propertyB: 'baz' }, { propertyB: 'qux' }] } ]
	 * Document.objArrayToArrayObj({ propertyA: [{ propertyB: ['foo', 'bar'] }, { propertyB: ['baz', 'qux'] }] });
	 */
	static objArrayToArrayObj = obj =>
		// each property of the object is anticipated to logically represent an array of data
		// the object's arrayed properties will be transformed into an array of objects with the
		//   arrayed values being "exploded" into a new object
		// if the arrayed properties are themselves objects, they will need to be recursively "exploded" as well
		Object.keys(obj).reduce((acc, key) => {
			const propertyVal = castArray(obj[key]);
			propertyVal.forEach((arrayVal, idx) => {
				acc[idx] = acc[idx] == null ? {} : acc[idx]; // define if first use of this array index

				if (isPlainObject(arrayVal)) {
					// recursively explode object's properties
					acc[idx][key] = Document.objArrayToArrayObj(arrayVal);
					return;
				}

				acc[idx][key] = arrayVal;
			});
			return acc;
		}, []);

	constructor(schema, record) {
		if (!(schema instanceof Schema) || !Array.isArray(record)) {
			throw new Error();
		}
		Object.defineProperties(this, {
			/**
			 * Schema instance which defined this document
			 * @member {Schema} _schema
			 * @memberof Document
			 * @instance
			 * @private
			 */
			_schema: {
				value: schema,
			},
			/**
			 * Record array of multivalue data
			 * @member {*[]} _record
			 * @memberof Document
			 * @instance
			 * @private
			 */
			_record: {
				value: record,
				writable: true,
			},
			_applySchemaToRecord: {
				configurable: false,
				enumerable: false,
				writable: false,
			},
		});

		assignIn(this, this._applySchemaToRecord());
	}

	/* private instance methods */

	/**
	 * Apply schema structure against data
	 * @function _applySchemaToRecord
	 * @memberof Document
	 * @instance
	 * @private
	 * @returns {Object} Object created by applying schema to record
	 */
	_applySchemaToRecord = () =>
		Object.keys(this._schema.paths).reduce((document, keyPath) => {
			const schemaValue = this._schema.paths[keyPath];

			if (Array.isArray(schemaValue)) {
				const arrayValue = schemaValue[0];
				if (arrayValue instanceof Schema) {
					// this is an array of schema instances - construct a new subdocument instance and transform to array of objects
					set(
						document,
						keyPath,
						Document.objArrayToArrayObj(new Document(arrayValue, this._record)),
					);
					return document;
				}

				if (Array.isArray(arrayValue)) {
					// this is a nested array of schema type instances
					const nestedValue = arrayValue[0];
					set(
						document,
						keyPath,
						castArray(nestedValue.get(this._record)).map(val => castArray(val)),
					);
					return document;
				}

				// this is an array of schema type instances
				set(document, keyPath, castArray(arrayValue.get(this._record)));
				return document;
			}

			if (schemaValue instanceof Schema) {
				// this is a schema instance - construct a new subdocument instance and destructure into assignment
				set(document, keyPath, { ...new Document(schemaValue, this._record) });
				return document;
			}

			// this is a schema type instance
			set(document, keyPath, schemaValue.get(this._record));
			return document;
		}, {});
}

export default Document;
