/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import Schema, { __RewireAPI__ as RewireAPI } from './';

describe('Schema', () => {
	describe('constructor', () => {
		it('should set instance variables when constructing', () => {
			const schema = new Schema({ foo: { path: '1', type: String } });
			assert.deepEqual(schema._definition, { foo: { path: '1', type: String } });
		});

		it('should throw if definition is not an object', () => {
			assert.throws(() => new Schema());
		});

		it('should throw if dictionaries is not an object', () => {
			assert.throws(() => new Schema({}, { dictionaries: 'foo' }));
		});

		it('should set the dict path for the record _id to the default @ID dictionary', () => {
			const schema = new Schema({});
			assert.deepEqual(schema.dictPaths, { _id: '@ID' });
		});

		it('should allow the default dictionary for _id to be overridden', () => {
			const schema = new Schema({}, { dictionaries: { _id: 'bar' } });
			assert.deepEqual(schema.dictPaths, { _id: 'bar' });
		});
	});

	describe('instance methods', () => {
		describe('getMvPaths', () => {
			const subdocumentSchema = {
				getMvPaths: stub(),
			};
			let schema;
			before(() => {
				schema = new Schema({ foo: { path: '1', type: String } });
			});

			it("should merge subdocument schemas paths with this schema's path", () => {
				schema._mvPaths = [['foo'], ['bar']];
				subdocumentSchema.getMvPaths.onCall(0).returns([['baz'], ['qux']]);
				subdocumentSchema.getMvPaths.onCall(1).returns([['corge']]);
				schema._subdocumentSchemas = [subdocumentSchema, subdocumentSchema];
				assert.deepEqual(schema.getMvPaths(), [['foo'], ['bar'], ['baz'], ['qux'], ['corge']]);
			});
		});

		describe('_buildPaths', () => {
			let schema;
			let _isDataDefinition;
			const schemaType = {
				Embedded: class {},
				String: class {},
			};

			before(() => {
				RewireAPI.__Rewire__('schemaType', schemaType);
				schema = new Schema({ foo: { path: '1', type: String } });
				_isDataDefinition = stub(schema, '_isDataDefinition');
				stub(schema, '_castArray').returns('castArrayResult');
				stub(schema, '_castDefinition').returns('castDefinitionResult');
			});

			beforeEach(() => {
				schema.paths = {}; // clear it out before each test
				_isDataDefinition.reset();
			});

			after(() => {
				RewireAPI.__ResetDependency__('schemaType');
			});

			it('should throw if definition contains a non-object property', () => {
				assert.throws(schema._buildPaths.bind(schema, { foo: 'bar' }));
			});

			it('should set path to result of _castArray if value is an array', () => {
				schema._buildPaths({ foo: [] });
				assert.deepEqual(schema.paths, { foo: 'castArrayResult' });
			});

			it('should set path to result of _castDefinition if value is an instance of Schema', () => {
				_isDataDefinition.returns(false);
				schema._buildPaths({ foo: new Schema({ foo: { path: '1', type: String } }) });
				assert.instanceOf(schema.paths.foo, schemaType.Embedded);
			});

			it('should set path to result of _castDefinition if value is a data definition', () => {
				_isDataDefinition.returns(true);
				schema._buildPaths({ foo: {} });
				assert.deepEqual(schema.paths, { foo: 'castDefinitionResult' });
			});

			it('should set flattened path value', () => {
				_isDataDefinition.onCall(0).returns(false);
				_isDataDefinition.onCall(1).returns(true);
				schema._buildPaths({ foo: { bar: {} } });
				assert.deepEqual(schema.paths, { 'foo.bar': 'castDefinitionResult' });
			});
		});

		describe('_castArray', () => {
			let schema;
			let _isDataDefinition;
			const schemaType = {
				Array: class {},
				DocumentArray: class {},
				NestedArray: class {},
				String: class {},
			};
			before(() => {
				schema = new Schema({});
				_isDataDefinition = stub(schema, '_isDataDefinition');
				RewireAPI.__Rewire__('schemaType', schemaType);
				stub(schema, '_castDefinition');
			});

			after(() => {
				RewireAPI.__ResetDependency__('schemaType');
			});

			beforeEach(() => {
				_isDataDefinition.reset();
			});

			it('should throw if castee is not an array', () => {
				assert.throws(schema._castArray.bind(schema, 'foo'));
			});

			it('should throw if castee is an array of length greater than 1', () => {
				assert.throws(schema._castArray.bind(schema, [{}, {}]));
			});

			it('should throw if castee is an array of non-objects', () => {
				assert.throws(schema._castArray.bind(schema, ['foo']));
			});

			it('should throw if castee is an nested array of non data definitions', () => {
				_isDataDefinition.returns(false);
				assert.throws(schema._castArray.bind(schema, [['foo']]));
			});

			it('should return an instance of NestedArray schemaType if a nested array of data definitions is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castArray([[{}]]), schemaType.NestedArray);
			});

			it('should return an instance of DocumentArray schemaType if an array of Schema is passed', () => {
				assert.instanceOf(
					schema._castArray([new Schema({ foo: { path: '1', type: String } })]),
					schemaType.DocumentArray,
				);
			});

			it('should return an instance of Array schemaType if an array of data definitions is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castArray([{}]), schemaType.Array);
			});

			it('should return an instance of DocumentArray schemaType if an array of objects is passed', () => {
				_isDataDefinition.returns(false);
				assert.instanceOf(schema._castArray([{}]), schemaType.DocumentArray);
			});
		});

		describe('_castDefinition', () => {
			let schema;
			let _isDataDefinition;
			const schemaType = {
				Boolean: class {},
				ISOCalendarDateTime: class {},
				ISOCalendarDate: class {},
				ISOTime: class {},
				Number: class {},
				String: class {
					path = 'foo';
					dictionary = 'bar';
				},
			};
			before(() => {
				schema = new Schema({});
				_isDataDefinition = stub(schema, '_isDataDefinition');
				RewireAPI.__Rewire__('schemaType', schemaType);
			});

			after(() => {
				RewireAPI.__ResetDependency__('schemaType');
			});

			beforeEach(() => {
				_isDataDefinition.reset();
				schema._mvPaths = [];
				schema.dictPaths = {};
			});

			it('should throw an error if a valid castee is not passed', () => {
				_isDataDefinition.returns(false);
				assert.throws(schema._castDefinition);
			});

			it('should return an instance of Boolean schemaType if a Boolean type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: Boolean }), schemaType.Boolean);
			});

			it('should return an instance of ISOCalendarDateTime schemaType if a schemaType.ISOCalendarDateTime type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(
					schema._castDefinition({ type: schemaType.ISOCalendarDateTime }),
					schemaType.ISOCalendarDateTime,
				);
			});

			it('should return an instance of ISOCalendarDate schemaType if a schemaType.ISOCalendarDate type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(
					schema._castDefinition({ type: schemaType.ISOCalendarDate }),
					schemaType.ISOCalendarDate,
				);
			});

			it('should return an instance of ISOTime schemaType if a schemaType.ISOTime type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: schemaType.ISOTime }), schemaType.ISOTime);
			});

			it('should return an instance of Number schemaType if a Number type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: Number }), schemaType.Number);
			});

			it('should return an instance of String schemaType if a String type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: String }), schemaType.String);
			});

			it('should throw if an unknown type is passed', () => {
				_isDataDefinition.returns(true);
				assert.throws(schema._castDefinition.bind(schema, { type: 'foo' }));
			});

			it('should update the mvPaths array with the schemaType path', () => {
				_isDataDefinition.returns(true);
				schema._castDefinition({ type: String, path: '1' });
				assert.deepEqual(schema._mvPaths, ['foo']);
			});

			it('should update the dictPaths object with the schemaType dictionary', () => {
				_isDataDefinition.returns(true);
				schema._castDefinition({ type: String, path: '1', dictionary: 'bar' }, 'foo');
				assert.deepEqual(schema.dictPaths, { foo: 'bar' });
			});
		});

		describe('_handleSubDocumentSchemas', () => {
			let schema;
			before(() => {
				schema = new Schema({});
				schema._mergeSchemaDictionaries = stub();
			});

			beforeEach(() => {
				schema._subdocumentSchemas = [];
			});

			it('should add passed schema to _subdocumentSchemas', () => {
				schema._handleSubDocumentSchemas('foo');
				assert.deepEqual(schema._subdocumentSchemas, ['foo']);
			});

			it('should call _mergeSchemaDictionaries with the passed parameters', () => {
				schema._handleSubDocumentSchemas('foo', 'bar');
				assert.isTrue(schema._mergeSchemaDictionaries.calledWith('foo', 'bar'));
			});
		});

		describe('_isDataDefinition', () => {
			let schema;
			before(() => {
				schema = new Schema({});
			});

			it('should return false if neither type nor path present', () => {
				assert.isFalse(schema._isDataDefinition('foo'));
			});

			it('should return false if only has type', () => {
				assert.isFalse(schema._isDataDefinition({ type: 'foo' }));
			});

			it('should return false if only has path', () => {
				assert.isFalse(schema._isDataDefinition({ path: 'foo' }));
			});

			it('should return true if has path and type', () => {
				assert.isTrue(schema._isDataDefinition({ type: 'foo', path: 'bar' }));
			});
		});

		describe('_mergeSchemaDictionaries', () => {
			let schema;
			before(() => {
				schema = new Schema({});
			});

			beforeEach(() => {
				schema.dictPaths = {};
			});

			it('should merge passed schema dictPaths into instance schema dictPaths', () => {
				schema.dictPaths = { foo: 'bar', baz: 'qux' };
				schema._mergeSchemaDictionaries({ dictPaths: { quux: 'corge', uier: 'grault' } }, 'garply');
				assert.deepEqual(schema.dictPaths, {
					foo: 'bar',
					baz: 'qux',
					'garply.quux': 'corge',
					'garply.uier': 'grault',
				});
			});
		});
	});
});
