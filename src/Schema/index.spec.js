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
				String: class {},
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
		});

		describe('_isDataDefinition', () => {
			let schema;
			before(() => {
				schema = new Schema({});
			});

			it('should return false', () => {
				assert.isFalse(schema._isDataDefinition('foo'));
			});

			it('should return true', () => {
				assert.isTrue(schema._isDataDefinition({ type: 'foo' }));
			});
		});
	});
});
