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
			const definition: SchemaDefinition = {
				prop1: [[{ prop1: { type: 'string', path: '1' } }]],
			};

			expect(() => {
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
			expect(schema.dictPaths.get('_id')).toBe('@ID');

			expect(schema.paths.get('stringProp')).toBeInstanceOf(StringType);
			expect(schema.dictPaths.get('stringProp')).toBe('stringPropDict');

			expect(schema.paths.get('numberProp')).toBeInstanceOf(NumberType);
			expect(schema.dictPaths.get('numberProp')).toBe('numberPropDict');

			expect(schema.paths.get('booleanProp')).toBeInstanceOf(BooleanType);
			expect(schema.dictPaths.get('booleanProp')).toBe('booleanPropDict');

			expect(schema.paths.get('isoCalendarDateProp')).toBeInstanceOf(ISOCalendarDateType);
			expect(schema.dictPaths.get('isoCalendarDateProp')).toBe('isoCalendarDatePropDict');

			expect(schema.paths.get('isoTimeProp')).toBeInstanceOf(ISOTimeType);
			expect(schema.dictPaths.get('isoTimeProp')).toBe('isoTimePropDict');

			expect(schema.paths.get('isoCalendarDateTimeProp')).toBeInstanceOf(ISOCalendarDateTimeType);
			expect(schema.dictPaths.get('isoCalendarDateTimeProp')).toBe('isoCalendarDateTimePropDict');

			expect(schema.paths.get('arrayProp')).toBeInstanceOf(ArrayType);
			expect(schema.dictPaths.get('arrayProp')).toBe('arrayPropDict');

			expect(schema.paths.get('nestedArrayProp')).toBeInstanceOf(NestedArrayType);
			expect(schema.dictPaths.get('nestedArrayProp')).toBe('nestedArrayPropDict');

			expect(schema.paths.get('embeddedProp')).toBeInstanceOf(EmbeddedType);
			expect(schema.dictPaths.get('embeddedProp.innerEmbeddedProp')).toBe('innerEmbeddedPropDict');

			expect(schema.paths.get('documentArrayProp')).toBeInstanceOf(DocumentArrayType);
			expect(schema.dictPaths.get('documentArrayProp.docStringProp')).toBe('docStringPropDict');
			expect(schema.dictPaths.get('documentArrayProp.docNumberProp')).toBe('docNumberPropDict');

			expect(schema.paths.get('documentArraySchemaProp')).toBeInstanceOf(DocumentArrayType);
			expect(schema.dictPaths.get('documentArraySchemaProp.docStringProp')).toBe(
				'docStringPropDict',
			);
			expect(schema.dictPaths.get('documentArraySchemaProp.docNumberProp')).toBe(
				'docNumberPropDict',
			);
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
