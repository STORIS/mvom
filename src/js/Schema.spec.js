/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import Schema, { __RewireAPI__ as RewireAPI } from './Schema';

describe('Schema', () => {
	describe('constructor', () => {
		test('should set instance variables when constructing', () => {
			const schema = new Schema({ foo: { path: '1', type: String } });
			expect(schema._definition).toEqual({ foo: { path: '1', type: String } });
		});

		test('should throw if definition is not an object', () => {
			expect(() => new Schema()).toThrow();
		});

		test('should throw if dictionaries is not an object', () => {
			expect(() => new Schema({}, { dictionaries: 'foo' })).toThrow();
		});

		test('should throw if idMatch is not a regular expression', () => {
			expect(() => new Schema({}, { idMatch: 'foo' })).toThrow();
		});

		test('should throw if idForeignKey is not a plain object', () => {
			expect(() => new Schema({}, { idForeignKey: 'foo' })).toThrow();
		});

		test('should set the dict path for the record _id to the default @ID dictionary', () => {
			const schema = new Schema({});
			expect(schema.dictPaths).toEqual({ _id: '@ID' });
		});

		test('should allow the default dictionary for _id to be overridden', () => {
			const schema = new Schema({}, { dictionaries: { _id: 'bar' } });
			expect(schema.dictPaths).toEqual({ _id: 'bar' });
		});

		test('should throw if encrypt is not a function', () => {
			expect(() => new Schema({}, { encrypt: 'foo' })).toThrow();
		});

		test('should throw if decrypt is not a function', () => {
			expect(() => new Schema({}, { decrypt: 'foo' })).toThrow();
		});
	});

	describe('instance methods', () => {
		describe('getMvPaths', () => {
			const subdocumentSchema = {
				getMvPaths: stub(),
			};
			let schema;
			beforeAll(() => {
				schema = new Schema({ foo: { path: '1', type: String } });
			});

			test("should merge subdocument schemas paths with this schema's path", () => {
				schema._positionPaths = new Map([
					['fooKey', ['foo']],
					['barKey', ['bar']],
				]);
				subdocumentSchema.getMvPaths.onCall(0).returns([['baz'], ['qux']]);
				subdocumentSchema.getMvPaths.onCall(1).returns([['corge']]);
				schema._subdocumentSchemas = new Map([
					['subdocumentSchemaKey1', subdocumentSchema],
					['subdocumentSchemaKey2', subdocumentSchema],
				]);
				expect(schema.getMvPaths()).toEqual([['foo'], ['bar'], ['baz'], ['qux'], ['corge']]);
			});
		});

		describe('getPositionPaths', () => {
			const subdocumentSchema = {
				getPositionPaths: stub(),
			};
			let schema;
			beforeAll(() => {
				schema = new Schema({ foo: { path: '1', type: String } });
			});

			test("should merge subdocument schemas position paths with this schema's position paths", () => {
				schema._positionPaths = new Map([['foo', [1]]]);
				subdocumentSchema.getPositionPaths.onCall(0).returns(new Map([['baz', [2]]]));
				subdocumentSchema.getPositionPaths.onCall(1).returns(new Map([['corge', [3]]]));
				schema._subdocumentSchemas = new Map([
					['subdocumentSchemaKey1', subdocumentSchema],
					['subdocumentSchemaKey2', subdocumentSchema],
				]);
				expect(Array.from(schema.getPositionPaths())).toEqual([
					['foo', [1]],
					['subdocumentSchemaKey1.baz', [2]],
					['subdocumentSchemaKey2.corge', [3]],
				]);
			});
		});

		describe('_buildPaths', () => {
			let schema;
			let _isDataDefinition;
			class EmbeddedType {}
			class StringType {}

			beforeAll(() => {
				RewireAPI.__Rewire__('EmbeddedType', EmbeddedType);
				RewireAPI.__Rewire__('StringType', StringType);
				schema = new Schema({ foo: { path: '1', type: String } });
				_isDataDefinition = stub(schema, '_isDataDefinition');
				stub(schema, '_castArray').returns('castArrayResult');
				stub(schema, '_castDefinition').returns('castDefinitionResult');
			});

			beforeEach(() => {
				schema.paths = {}; // clear it out before each test
				_isDataDefinition.reset();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('EmbeddedType');
				RewireAPI.__ResetDependency__('StringType');
			});

			test('should throw if definition contains a non-object property', () => {
				expect(schema._buildPaths.bind(schema, { foo: 'bar' })).toThrow();
			});

			test('should set path to result of _castArray if value is an array', () => {
				schema._buildPaths({ foo: [] });
				expect(schema.paths).toEqual({ foo: 'castArrayResult' });
			});

			test('should set path to result of _castDefinition if value is an instance of Schema', () => {
				_isDataDefinition.returns(false);
				schema._buildPaths({ foo: new Schema({ foo: { path: '1', type: String } }) });
				expect(schema.paths.foo).toBeInstanceOf(EmbeddedType);
			});

			test('should set path to result of _castDefinition if value is a data definition', () => {
				_isDataDefinition.returns(true);
				schema._buildPaths({ foo: {} });
				expect(schema.paths).toEqual({ foo: 'castDefinitionResult' });
			});

			test('should set flattened path value', () => {
				_isDataDefinition.onCall(0).returns(false);
				_isDataDefinition.onCall(1).returns(true);
				schema._buildPaths({ foo: { bar: {} } });
				expect(schema.paths).toEqual({ 'foo.bar': 'castDefinitionResult' });
			});
		});

		describe('_castArray', () => {
			let schema;
			let _isDataDefinition;

			class ArrayType {}
			class DocumentArrayType {}
			class NestedArrayType {}
			class StringType {}

			beforeAll(() => {
				schema = new Schema({});
				_isDataDefinition = stub(schema, '_isDataDefinition');
				RewireAPI.__Rewire__('ArrayType', ArrayType);
				RewireAPI.__Rewire__('DocumentArrayType', DocumentArrayType);
				RewireAPI.__Rewire__('NestedArrayType', NestedArrayType);
				RewireAPI.__Rewire__('StringType', StringType);
				stub(schema, '_castDefinition');
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('ArrayType');
				RewireAPI.__ResetDependency__('DocumentArrayType');
				RewireAPI.__ResetDependency__('NestedArrayType');
				RewireAPI.__ResetDependency__('StringType');
			});

			beforeEach(() => {
				_isDataDefinition.reset();
			});

			test('should throw if castee is not an array', () => {
				expect(schema._castArray.bind(schema, 'foo')).toThrow();
			});

			test('should throw if castee is an array of length greater than 1', () => {
				expect(schema._castArray.bind(schema, [{}, {}])).toThrow();
			});

			test('should throw if castee is an array of non-objects', () => {
				expect(schema._castArray.bind(schema, ['foo'])).toThrow();
			});

			test('should throw if castee is an nested array of non data definitions', () => {
				_isDataDefinition.returns(false);
				expect(schema._castArray.bind(schema, [['foo']])).toThrow();
			});

			test('should return an instance of NestedArray schemaType if a nested array of data definitions is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castArray([[{}]])).toBeInstanceOf(NestedArrayType);
			});

			test('should return an instance of DocumentArray schemaType if an array of Schema is passed', () => {
				expect(
					schema._castArray([new Schema({ foo: { path: '1', type: String } })]),
				).toBeInstanceOf(DocumentArrayType);
			});

			test('should return an instance of Array schemaType if an array of data definitions is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castArray([{}])).toBeInstanceOf(ArrayType);
			});

			test('should return an instance of DocumentArray schemaType if an array of objects is passed', () => {
				_isDataDefinition.returns(false);
				expect(schema._castArray([{}])).toBeInstanceOf(DocumentArrayType);
			});
		});

		describe('_castDefinition', () => {
			let schema;
			let _isDataDefinition;
			class BooleanType {}
			class ISOCalendarDateTimeType {}
			class ISOCalendarDateType {}
			class ISOTimeType {}
			class NumberType {}
			class StringType {
				path = 'foo';

				dictionary = 'bar';
			}

			beforeAll(() => {
				schema = new Schema({});
				_isDataDefinition = stub(schema, '_isDataDefinition');
				RewireAPI.__Rewire__('BooleanType', BooleanType);
				RewireAPI.__Rewire__('ISOCalendarDateTimeType', ISOCalendarDateTimeType);
				RewireAPI.__Rewire__('ISOCalendarDateType', ISOCalendarDateType);
				RewireAPI.__Rewire__('ISOTimeType', ISOTimeType);
				RewireAPI.__Rewire__('NumberType', NumberType);
				RewireAPI.__Rewire__('StringType', StringType);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('BooleanType');
				RewireAPI.__ResetDependency__('ISOCalendarDateTimeType');
				RewireAPI.__ResetDependency__('ISOCalendarDateType');
				RewireAPI.__ResetDependency__('ISOTimeType');
				RewireAPI.__ResetDependency__('NumberType');
				RewireAPI.__ResetDependency__('StringType');
			});

			beforeEach(() => {
				_isDataDefinition.reset();
				schema._mvPaths = [];
				schema.dictPaths = {};
			});

			test('should throw an error if a valid castee is not passed', () => {
				_isDataDefinition.returns(false);
				expect(schema._castDefinition).toThrow();
			});

			test('should return an instance of Boolean schemaType if a Boolean type is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: Boolean })).toBeInstanceOf(BooleanType);
			});

			test('should return an instance of ISOCalendarDateTime schemaType if a ISOCalendarDateTimeType is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: ISOCalendarDateTimeType })).toBeInstanceOf(
					ISOCalendarDateTimeType,
				);
			});

			test('should return an instance of ISOCalendarDate schemaType if a ISOCalendarDateTimeType is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: ISOCalendarDateType })).toBeInstanceOf(
					ISOCalendarDateType,
				);
			});

			test('should return an instance of ISOTime schemaType if a ISOCalendarDateTimeType is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: ISOTimeType })).toBeInstanceOf(ISOTimeType);
			});

			test('should return an instance of Number schemaType if a Number type is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: Number })).toBeInstanceOf(NumberType);
			});

			test('should return an instance of String schemaType if a String type is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition({ type: String })).toBeInstanceOf(StringType);
			});

			test('should throw if an unknown type is passed', () => {
				_isDataDefinition.returns(true);
				expect(schema._castDefinition.bind(schema, { type: 'foo' })).toThrow();
			});

			test('should update the _positionPaths map with the keyPath and schemaType path', () => {
				_isDataDefinition.returns(true);
				schema._castDefinition({ type: String, path: '1' }, 'keyPath');
				expect(schema._positionPaths.get('keyPath')).toEqual('foo');
			});

			test('should update the dictPaths object with the schemaType dictionary', () => {
				_isDataDefinition.returns(true);
				schema._castDefinition({ type: String, path: '1', dictionary: 'bar' }, 'foo');
				expect(schema.dictPaths).toEqual({ foo: 'bar' });
			});
		});

		describe('_handleSubDocumentSchemas', () => {
			let schema;
			beforeAll(() => {
				schema = new Schema({});
				schema._mergeSchemaDictionaries = stub();
			});

			beforeEach(() => {
				schema._subdocumentSchemas = new Map();
			});

			test('should add passed schema to _subdocumentSchemas', () => {
				schema._handleSubDocumentSchemas('foo', 'keyPath');
				expect(schema._subdocumentSchemas.get('keyPath')).toEqual('foo');
			});

			test('should call _mergeSchemaDictionaries with the passed parameters', () => {
				schema._handleSubDocumentSchemas('foo', 'bar');
				expect(schema._mergeSchemaDictionaries.calledWith('foo', 'bar')).toBe(true);
			});
		});

		describe('_isDataDefinition', () => {
			let schema;
			beforeAll(() => {
				schema = new Schema({});
			});

			test('should return false if neither type nor path present', () => {
				expect(schema._isDataDefinition('foo')).toBe(false);
			});

			test('should return false if only has type', () => {
				expect(schema._isDataDefinition({ type: 'foo' })).toBe(false);
			});

			test('should return false if only has path', () => {
				expect(schema._isDataDefinition({ path: 'foo' })).toBe(false);
			});

			test('should return true if has path and type', () => {
				expect(schema._isDataDefinition({ type: 'foo', path: 'bar' })).toBe(true);
			});
		});

		describe('_mergeSchemaDictionaries', () => {
			let schema;
			beforeAll(() => {
				schema = new Schema({});
			});

			beforeEach(() => {
				schema.dictPaths = {};
			});

			test('should merge passed schema dictPaths into instance schema dictPaths', () => {
				schema.dictPaths = { foo: 'bar', baz: 'qux' };
				schema._mergeSchemaDictionaries({ dictPaths: { quux: 'corge', uier: 'grault' } }, 'garply');
				expect(schema.dictPaths).toEqual({
					foo: 'bar',
					baz: 'qux',
					'garply.quux': 'corge',
					'garply.uier': 'grault',
				});
			});
		});

		describe('transformPathsToDbPositions', () => {
			let schema;
			beforeEach(() => {
				schema = new Schema({
					foo: { path: '1', type: String },
					bar: {
						bar1: { path: '2.1', type: String },
						bar2: { path: '2.2', type: String },
					},
				});
			});

			test('should return empty positions array when paths array is empty', () => {
				expect(schema.transformPathsToDbPositions([])).toEqual([]);
			});

			test('should transform the paths to positions', () => {
				const properties = ['foo', 'bar'];
				expect(schema.transformPathsToDbPositions(properties)).toEqual([1, 2]);
			});

			test('should transform the paths to positions for nested schema', () => {
				schema = new Schema({
					foo: new Schema({
						bar: { path: '1', type: String },
					}),
				});
				const properties = ['foo.bar'];
				expect(schema.transformPathsToDbPositions(properties)).toEqual([1]);
			});

			test('should transform the paths to positions for DocumentArray schemaType if an array of Schema is passed', () => {
				schema = new Schema({
					foo: [
						new Schema({
							bar: { path: '1', type: String },
						}),
					],
				});
				const properties = ['foo.bar'];
				expect(schema.transformPathsToDbPositions(properties)).toEqual([1]);
			});

			test('should transform the paths to positions for NestedArrayType schemaType', () => {
				schema = new Schema({
					foo: [[{ path: '1', type: String }]],
				});
				const properties = ['foo'];
				expect(schema.transformPathsToDbPositions(properties)).toEqual([1]);
			});

			test('should skip the path if no keys are found in positionPaths', () => {
				const properties = ['foo', 'bar3.'];
				expect(schema.transformPathsToDbPositions(properties)).toEqual([1]);
			});

			test('should skip the transformation if path is not an array', () => {
				const properties = 'foo';
				expect(schema.transformPathsToDbPositions(properties)).toEqual([]);
			});
		});
	});
});
