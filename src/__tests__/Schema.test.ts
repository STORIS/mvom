import {
	BooleanDataTransformer,
	ISOCalendarDateDataTransformer,
	ISOCalendarDateTimeDataTransformer,
	ISOTimeDataTransformer,
	NumberDataTransformer,
	StringDataTransformer,
} from '../dataTransformers';
import { InvalidParameterError } from '../errors';
import type { SchemaDefinition } from '../Schema';
import Schema from '../Schema';
import {
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
} from '../schemaType';

describe('constructor', () => {
	describe('errors', () => {
		test('should throw InvalidParameterError if array definition contains multiple elements', () => {
			const definition: SchemaDefinition = {
				prop1: [
					{ type: 'string', path: '1' },
					{ type: 'string', path: '2' },
				],
			};

			expect(() => {
				new Schema(definition);
			}).toThrow(InvalidParameterError);
		});

		test('should throw InvalidParameterError if nested array definition contains multiple elements', () => {
			const definition: SchemaDefinition = {
				prop1: [
					[
						{ type: 'string', path: '1' },
						{ type: 'string', path: '2' },
					],
				],
			};

			expect(() => {
				new Schema(definition);
			}).toThrow(InvalidParameterError);
		});

		test('should throw InvalidParameterError if nested array definition does not represent a scalar value', () => {
			const definition = {
				prop1: [[{ prop1: { type: 'string', path: '1' } }]],
			};

			expect(() => {
				// @ts-expect-error: definition is not a valid SchemaDefinition
				new Schema(definition);
			}).toThrow(InvalidParameterError);
		});
	});

	describe('path setup', () => {
		test('should construct a schema with all possible schemaTypes', () => {
			const embeddedDefinition: SchemaDefinition = {
				innerEmbeddedProp: { type: 'string', path: '9', dictionary: 'innerEmbeddedPropDict' },
			};
			const documentArrayDefinition: SchemaDefinition = {
				docStringProp: { type: 'string', path: '12', dictionary: 'docStringPropDict' },
				docNumberProp: { type: 'number', path: '13', dictionary: 'docNumberPropDict' },
			};
			const definition: SchemaDefinition = {
				stringProp: { type: 'string', path: '1', dictionary: 'stringPropDict' },
				numberProp: { type: 'number', path: '2', dictionary: 'numberPropDict' },
				booleanProp: { type: 'boolean', path: '3', dictionary: 'booleanPropDict' },
				isoCalendarDateProp: {
					type: 'ISOCalendarDate',
					path: '4',
					dictionary: 'isoCalendarDatePropDict',
				},
				isoTimeProp: { type: 'ISOTime', path: '5', dictionary: 'isoTimePropDict' },
				isoCalendarDateTimeProp: {
					type: 'ISOCalendarDateTime',
					path: '6',
					dictionary: 'isoCalendarDateTimePropDict',
				},
				arrayProp: [{ type: 'string', path: '7', dictionary: 'arrayPropDict' }],
				nestedArrayProp: [[{ type: 'string', path: '8', dictionary: 'nestedArrayPropDict' }]],
				embeddedProp: new Schema(embeddedDefinition),
				documentArrayProp: [
					{
						docStringProp: { type: 'string', path: '10', dictionary: 'docStringPropDict' },
						docNumberProp: { type: 'number', path: '11', dictionary: 'docNumberPropDict' },
					},
				],
				documentArraySchemaProp: [new Schema(documentArrayDefinition)],
			};

			const schema = new Schema(definition);
			expect(schema.dictPaths.get('_id')).toEqual({
				dictionary: '@ID',
				dataTransformer: expect.any(StringDataTransformer),
			});

			expect(schema.paths.get('stringProp')).toBeInstanceOf(StringType);
			expect(schema.dictPaths.get('stringProp')).toEqual({
				dictionary: 'stringPropDict',
				dataTransformer: expect.any(StringType),
			});

			expect(schema.paths.get('numberProp')).toBeInstanceOf(NumberType);
			expect(schema.dictPaths.get('numberProp')).toEqual({
				dictionary: 'numberPropDict',
				dataTransformer: expect.any(NumberType),
			});

			expect(schema.paths.get('booleanProp')).toBeInstanceOf(BooleanType);
			expect(schema.dictPaths.get('booleanProp')).toEqual({
				dictionary: 'booleanPropDict',
				dataTransformer: expect.any(BooleanType),
			});

			expect(schema.paths.get('isoCalendarDateProp')).toBeInstanceOf(ISOCalendarDateType);
			expect(schema.dictPaths.get('isoCalendarDateProp')).toEqual({
				dictionary: 'isoCalendarDatePropDict',
				dataTransformer: expect.any(ISOCalendarDateType),
			});

			expect(schema.paths.get('isoTimeProp')).toBeInstanceOf(ISOTimeType);
			expect(schema.dictPaths.get('isoTimeProp')).toEqual({
				dictionary: 'isoTimePropDict',
				dataTransformer: expect.any(ISOTimeType),
			});

			expect(schema.paths.get('isoCalendarDateTimeProp')).toBeInstanceOf(ISOCalendarDateTimeType);
			expect(schema.dictPaths.get('isoCalendarDateTimeProp')).toEqual({
				dictionary: 'isoCalendarDateTimePropDict',
				dataTransformer: expect.any(ISOCalendarDateTimeType),
			});

			expect(schema.paths.get('arrayProp')).toBeInstanceOf(ArrayType);
			expect(schema.dictPaths.get('arrayProp')).toEqual({
				dictionary: 'arrayPropDict',
				dataTransformer: expect.any(StringType),
			});

			expect(schema.paths.get('nestedArrayProp')).toBeInstanceOf(NestedArrayType);
			expect(schema.dictPaths.get('nestedArrayProp')).toEqual({
				dictionary: 'nestedArrayPropDict',
				dataTransformer: expect.any(StringType),
			});

			expect(schema.paths.get('embeddedProp')).toBeInstanceOf(EmbeddedType);
			expect(schema.dictPaths.get('embeddedProp.innerEmbeddedProp')).toEqual({
				dictionary: 'innerEmbeddedPropDict',
				dataTransformer: expect.any(StringType),
			});

			expect(schema.paths.get('documentArrayProp')).toBeInstanceOf(DocumentArrayType);
			expect(schema.dictPaths.get('documentArrayProp.docStringProp')).toEqual({
				dictionary: 'docStringPropDict',
				dataTransformer: expect.any(StringType),
			});
			expect(schema.dictPaths.get('documentArrayProp.docNumberProp')).toEqual({
				dictionary: 'docNumberPropDict',
				dataTransformer: expect.any(NumberType),
			});

			expect(schema.paths.get('documentArraySchemaProp')).toBeInstanceOf(DocumentArrayType);
			expect(schema.dictPaths.get('documentArraySchemaProp.docStringProp')).toEqual({
				dictionary: 'docStringPropDict',
				dataTransformer: expect.any(StringType),
			});
			expect(schema.dictPaths.get('documentArraySchemaProp.docNumberProp')).toEqual({
				dictionary: 'docNumberPropDict',
				dataTransformer: expect.any(NumberType),
			});
		});
	});

	describe('optional dictionaries', () => {
		test('should add a string dictionary if type information not provided', () => {
			const schema = new Schema({}, { dictionaries: { testProp: 'testDict' } });

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(StringDataTransformer),
			});
		});

		test('should add a string dictionary if type is string', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'string' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(StringDataTransformer),
			});
		});

		test('should add a number dictionary if type is number', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'number' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(NumberDataTransformer),
			});
		});

		test('should add a boolean dictionary if type is boolean', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'boolean' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(BooleanDataTransformer),
			});
		});

		test('should add a ISOCalendarDate dictionary if type is ISOCalendarDate', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'ISOCalendarDate' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(ISOCalendarDateDataTransformer),
			});
		});

		test('should add a ISOCalendarDateTime dictionary if type is ISOCalendarDateTime', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'ISOCalendarDateTime' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(ISOCalendarDateTimeDataTransformer),
			});
		});

		test('should add a ISOTime dictionary if type is ISOTime', () => {
			const schema = new Schema(
				{},
				{ dictionaries: { testProp: { dictionary: 'testDict', type: 'ISOTime' } } },
			);

			expect(schema.dictPaths.get('testProp')).toEqual({
				dictionary: 'testDict',
				dataTransformer: expect.any(ISOTimeDataTransformer),
			});
		});
	});
});

describe('getMvPaths', () => {
	test('should return all multivalue paths', () => {
		const embeddedDefinition: SchemaDefinition = {
			innerEmbeddedProp: { type: 'string', path: '9' },
		};
		const documentArrayDefinition: SchemaDefinition = {
			docStringProp: { type: 'string', path: '12' },
			docNumberProp: { type: 'number', path: '13' },
		};
		const definition: SchemaDefinition = {
			stringProp: { type: 'string', path: '1' },
			stringValueProp: { type: 'string', path: '14.2' },
			numberProp: { type: 'number', path: '2' },
			booleanProp: { type: 'boolean', path: '3' },
			isoCalendarDateProp: { type: 'ISOCalendarDate', path: '4' },
			isoTimeProp: { type: 'ISOTime', path: '5' },
			isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '6' },
			arrayProp: [{ type: 'string', path: '7' }],
			nestedArrayProp: [[{ type: 'string', path: '8' }]],
			embeddedProp: new Schema(embeddedDefinition),
			documentArrayProp: [
				{
					docStringProp: { type: 'string', path: '10' },
					docNumberProp: { type: 'number', path: '11' },
				},
			],
			documentArraySchemaProp: [new Schema(documentArrayDefinition)],
		};
		const schema = new Schema(definition);

		const expected: number[][] = [
			[0],
			[1],
			[2],
			[3],
			[4],
			[5],
			[6],
			[7],
			[8],
			[9],
			[10],
			[11],
			[12],
			[13, 1],
		];
		expect(schema.getMvPaths()).toEqual(expect.arrayContaining(expected));
	});
});

describe('transformPathsToDbPositions', () => {
	const embeddedDefinition: SchemaDefinition = {
		innerEmbeddedProp: { type: 'string', path: '9' },
	};
	const documentArrayDefinition: SchemaDefinition = {
		docStringProp: { type: 'string', path: '12' },
		docNumberProp: { type: 'number', path: '13' },
	};
	const definition: SchemaDefinition = {
		stringProp: { type: 'string', path: '1' },
		stringValueProp: { type: 'string', path: '14.2' },
		numberProp: { type: 'number', path: '2' },
		booleanProp: { type: 'boolean', path: '3' },
		isoCalendarDateProp: { type: 'ISOCalendarDate', path: '4' },
		isoTimeProp: { type: 'ISOTime', path: '5' },
		isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '6' },
		arrayProp: [{ type: 'string', path: '7' }],
		nestedArrayProp: [[{ type: 'string', path: '8' }]],
		embeddedProp: new Schema(embeddedDefinition),
		documentArrayProp: [
			{
				docStringProp: { type: 'string', path: '10' },
				docNumberProp: { type: 'number', path: '11' },
			},
		],
		documentArraySchemaProp: [new Schema(documentArrayDefinition)],
	};
	const schema = new Schema(definition);

	test('should return no positions if path list is empty', () => {
		expect(schema.transformPathsToDbPositions([])).toEqual([]);
	});

	test('should return positions of specified path', () => {
		expect(schema.transformPathsToDbPositions(['stringProp'])).toEqual([1]);
	});

	test('should return positions of multiple paths', () => {
		expect(schema.transformPathsToDbPositions(['stringProp', 'booleanProp'])).toEqual([1, 3]);
	});

	test('should return positions of embedded documents', () => {
		expect(schema.transformPathsToDbPositions(['embeddedProp'])).toEqual([9]);
	});

	test('should return positions of embedded document properties', () => {
		expect(schema.transformPathsToDbPositions(['embeddedProp.innerEmbeddedProp'])).toEqual([9]);
	});

	test('should return positions of document arrays', () => {
		expect(schema.transformPathsToDbPositions(['documentArrayProp'])).toEqual([10, 11]);
	});

	test('should return positions of document array properties', () => {
		expect(schema.transformPathsToDbPositions(['documentArrayProp.docStringProp'])).toEqual([10]);
	});

	test('should return no positions if dotted path is not in schema', () => {
		expect(schema.transformPathsToDbPositions(['not.here'])).toEqual([]);
	});
});
