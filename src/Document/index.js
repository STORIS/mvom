import castArray from 'lodash/castArray';
import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import Schema from 'Schema';

/**
 * A document object
 */
class Document {
	/* static methods */
	/**
	 * Apply schema structure against data
	 * @function applySchemaToRecord
	 * @memberof Document
	 * @static
	 * @protected
	 * @param {Schema} schema - Schema to map against data
	 * @param {*[]} record - Array of data to apply schema against
	 * @returns {Object} Object created by applying schema to record
	 */
	static applySchemaToRecord = (schema, record) =>
		Object.keys(schema.paths).reduce((document, keyPath) => {
			const schemaValue = schema.paths[keyPath];

			if (Array.isArray(schemaValue)) {
				const arrayValue = schemaValue[0];
				if (arrayValue instanceof Schema) {
					// this is an array of schema definitions
					set(
						document,
						keyPath,
						Document.objArrayToArrayObj(Document.applySchemaToRecord(arrayValue, record)),
					);
					return document;
				}

				if (Array.isArray(arrayValue)) {
					// this is a nested array of data definitions
					const nestedValue = arrayValue[0];
					set(
						document,
						keyPath,
						castArray(Document.getFromMvData(record, nestedValue.path)).map(val => castArray(val)),
					);
					return document;
				}

				// this is an array of data definitions
				set(document, keyPath, castArray(Document.getFromMvData(record, arrayValue.path)));
				return document;
			}

			if (schemaValue instanceof Schema) {
				// this value is set to the result of nested schema definition
				set(document, keyPath, Document.applySchemaToRecord(schemaValue, record));
				return document;
			}

			// this value is a data definition
			set(document, keyPath, Document.getFromMvData(record, schemaValue.path));
			return document;
		}, {});

	/**
	 * Get data from the specified keypath
	 * @function getFromMvData
	 * @memberof Document
	 * @static
	 * @protected
	 * @param {*[]} record - Data to get value from
	 * @param {number[]} mvPath - Keypath from which to pull data
	 * @returns {*} Value of data at specified location
	 */
	static getFromMvData = (record, mvPath) =>
		mvPath.reduce((acc, pathPart) => castArray(acc)[pathPart], record);

	/**
	 * Convert an object containing properties which are arrays to an array of objects
	 * @function objArrayToArrayObj
	 * @memberof Document
	 * @static
	 * @protected
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

	/* private instance methods */
	/**
	 * Set configurable, enumerable, and writable property descriptors of all instance properties to false
	 * @function _protectProperties
	 * @memberof Document
	 * @instance
	 * @protected
	 */
	_protectProperties = () => {
		Object.keys(this).forEach(prop => {
			Object.defineProperty(this, prop, {
				configurable: false,
				enumerable: false,
				writable: false,
			});
		});
	};
}

export default Document;
