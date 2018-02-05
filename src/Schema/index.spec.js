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
		describe('_buildPaths', () => {
			let schema;
			let _isDataDefinition;
			const SchemaType = class {};
			before(() => {
				schema = new Schema({ foo: { path: '1', type: String } });
				_isDataDefinition = stub(schema, '_isDataDefinition');
				stub(schema, '_castDefinition').returns(new SchemaType());
			});

			beforeEach(() => {
				schema.paths = {}; // clear it out before each test
				_isDataDefinition.reset();
			});

			it('should throw an error if array length is greater than 1', () => {
				schema._definition = { foo: [{ path: '1' }, { path: '2' }] };
				assert.throws(schema._buildPaths);
			});

			it('should throw an error if array does not contain a language object', () => {
				schema._definition = { foo: ['bar'] };
				assert.throws(schema._buildPaths);
			});

			it('should throw an error if array of arrays does not contain a data definition', () => {
				_isDataDefinition.returns(false);
				schema._definition = { foo: [['bar']] };
				assert.throws(schema._buildPaths);
			});

			it('should set paths for an array of arrays containing data definitions', () => {
				_isDataDefinition.returns(true);
				schema._definition = { foo: [[{}]] };
				schema._buildPaths();
				assert.instanceOf(schema.paths.foo[0][0], SchemaType);
			});

			it('should set paths for an array containing data definitions', () => {
				_isDataDefinition.returns(true);
				schema._definition = { foo: [{}] };
				schema._buildPaths();
				assert.instanceOf(schema.paths.foo[0], SchemaType);
			});

			it('should set paths to the previously built array of Schema', () => {
				_isDataDefinition.returns(true);
				const nestedSchema = new Schema({ bar: { path: '1', type: String } });
				schema._definition = { foo: [nestedSchema] };
				schema._buildPaths();
				assert.deepEqual(schema.paths, { foo: [nestedSchema] });
			});

			it('should return an array of newly compiled schema', () => {
				_isDataDefinition.onCall(0).returns(false);
				_isDataDefinition.onCall(1).returns(true);
				schema._definition = { foo: [{ bar: { path: '1', type: String } }] };
				schema._buildPaths();
				assert.instanceOf(schema.paths.foo[0], Schema);
			});

			it('should set paths to the previously built Schema', () => {
				_isDataDefinition.returns(true);
				const nestedSchema = new Schema({ bar: { path: '1', type: String } });
				schema._definition = { foo: nestedSchema };
				schema._buildPaths();
				assert.deepEqual(schema.paths, { foo: nestedSchema });
			});

			it('should set paths to the passed definition', () => {
				_isDataDefinition.returns(true);
				schema._definition = { foo: {} };
				schema._buildPaths();
				assert.instanceOf(schema.paths.foo, SchemaType);
			});

			it('should recusively process nested objects', () => {
				_isDataDefinition.onCall(0).returns(false);
				_isDataDefinition.onCall(1).returns(true);
				schema._definition = { foo: { bar: {} } };
				schema._buildPaths();
				assert.instanceOf(schema.paths['foo.bar'], SchemaType);
			});

			it('should throw an error if the schema definition is invalid', () => {
				schema._definition = 'foo';
				assert.throws(schema._buildPaths);
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

			it('should throw an error if a valid dataDefinition is not passed', () => {
				_isDataDefinition.returns(false);
				assert.throws(schema._castDefinition);
			});

			it('should return an instance of Boolean schemaType if a Boolean type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: Boolean }), schemaType.Boolean);
			});

			it('should return an instance of Boolean schemaType if a schemaType.Boolean type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: schemaType.Boolean }), schemaType.Boolean);
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

			it('should return an instance of Number schemaType if a schemaType.Number type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: schemaType.Number }), schemaType.Number);
			});

			it('should return an instance of String schemaType if a String type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: String }), schemaType.String);
			});

			it('should return an instance of String schemaType if a schemaType.String type is passed', () => {
				_isDataDefinition.returns(true);
				assert.instanceOf(schema._castDefinition({ type: schemaType.String }), schemaType.String);
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
