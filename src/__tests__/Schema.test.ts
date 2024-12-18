import {
	BooleanDataTransformer,
	ISOCalendarDateDataTransformer,
	ISOCalendarDateTimeDataTransformer,
	ISOTimeDataTransformer,
	NumberDataTransformer,
	StringDataTransformer,
} from '../dataTransformers';
import { InvalidParameterError } from '../errors';
import type {
	FlattenDocument,
	InferDocumentObject,
	InferModelObject,
	InferSchemaPaths,
	SchemaDefinition,
} from '../Schema';
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
import type { Equals, ISOCalendarDate, ISOCalendarDateTime, ISOTime, MvRecord } from '../types';

describe('constructor', () => {
	describe('errors', () => {
		test('should throw InvalidParameterError if array definition contains multiple elements', () => {
			const definition = {
				prop1: [
					{ type: 'string', path: '1' },
					{ type: 'string', path: '2' },
				],
			};

			expect(() => {
				// @ts-expect-error: intentionally passing invalid argument to test
				new Schema(definition);
			}).toThrow(InvalidParameterError);
		});

		test('should throw InvalidParameterError if nested array definition contains multiple elements', () => {
			const definition = {
				prop1: [
					[
						{ type: 'string', path: '1' },
						{ type: 'string', path: '2' },
					],
				],
			};

			expect(() => {
				// @ts-expect-error: intentionally passing invalid argument to test
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
			const embeddedDefinition = {
				innerEmbeddedProp: { type: 'string', path: '9', dictionary: 'innerEmbeddedPropDict' },
			} satisfies SchemaDefinition;
			const documentArrayDefinition = {
				docStringProp: { type: 'string', path: '12', dictionary: 'docStringPropDict' },
				docNumberProp: { type: 'number', path: '13', dictionary: 'docNumberPropDict' },
			} satisfies SchemaDefinition;
			const definition = {
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
			} satisfies SchemaDefinition;

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
		const embeddedDefinition = {
			innerEmbeddedProp: { type: 'string', path: '9' },
		} satisfies SchemaDefinition;
		const documentArrayDefinition = {
			docStringProp: { type: 'string', path: '12' },
			docNumberProp: { type: 'number', path: '13' },
		} satisfies SchemaDefinition;
		const definition = {
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
		} satisfies SchemaDefinition;
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
	const embeddedDefinition = {
		innerEmbeddedProp: { type: 'string', path: '9' },
	} satisfies SchemaDefinition;
	const documentArrayDefinition = {
		docStringProp: { type: 'string', path: '12' },
		docNumberProp: { type: 'number', path: '13' },
	} satisfies SchemaDefinition;
	const definition = {
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
	} satisfies SchemaDefinition;
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

describe('transformPathsToOrdinalPositions', () => {
	const embeddedDefinition = {
		innerEmbeddedProp: { type: 'string', path: '9' },
	} satisfies SchemaDefinition;
	const documentArrayDefinition = {
		docStringProp: { type: 'string', path: '12' },
		docNumberProp: { type: 'number', path: '13' },
	} satisfies SchemaDefinition;
	const definition = {
		stringProp: { type: 'string', path: '1' },
		stringValueProp: { type: 'string', path: '14.2' },
		stringSubvalueProp: { type: 'string', path: '14.2.3' },
		stringArrayValueProp: [{ type: 'string', path: '15.2' }],
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
	} satisfies SchemaDefinition;
	const schema = new Schema(definition);

	test('should throw error if invalid path provided', () => {
		// @ts-expect-error: intentionally passing invalid argument to test
		expect(() => schema.transformPathToOrdinalPosition('bad-path')).toThrow(Error);
	});

	test('should return position of specified path filling in value and subvalue positions to 1 if not specified', () => {
		expect(schema.transformPathToOrdinalPosition('stringProp')).toBe('1.1.1');
	});

	test('should return positions of embedded document properties', () => {
		expect(schema.transformPathToOrdinalPosition('embeddedProp.innerEmbeddedProp')).toBe('9.1.1');
	});

	test('should return positions of document array properties', () => {
		expect(schema.transformPathToOrdinalPosition('documentArrayProp.docStringProp')).toBe('10.1.1');
	});

	test('should return correct ordinal position if path is to a value', () => {
		expect(schema.transformPathToOrdinalPosition('stringValueProp')).toBe('14.2.1');
	});

	test('should return correct ordinal position if path is to a subvalue', () => {
		expect(schema.transformPathToOrdinalPosition('stringSubvalueProp')).toBe('14.2.3');
	});

	test('should return correct ordinal position for array at value position', () => {
		expect(schema.transformPathToOrdinalPosition('stringArrayValueProp')).toBe('15.2.1');
	});
});

describe('utility types', () => {
	describe('InferDocumentObject', () => {
		describe('scalars', () => {
			test('should infer string type', () => {
				// not required should be nullable
				const schema1 = new Schema({ stringProp: { type: 'string', path: '1' } });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ stringProp: string | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ stringProp: { type: 'string', path: '1', required: true } });
				const test2: Equals<InferDocumentObject<typeof schema2>, { stringProp: string }> = true;
				expect(test2).toBe(true);

				// not required enum should be union of enum values and null
				const schema3 = new Schema({
					stringProp: { type: 'string', path: '1', enum: ['foo', 'bar'] as const },
				});
				const test3: Equals<
					InferDocumentObject<typeof schema3>,
					{ stringProp: 'foo' | 'bar' | null }
				> = true;
				expect(test3).toBe(true);

				// required enum should not be nullable
				const schema4 = new Schema({
					stringProp: { type: 'string', path: '1', enum: ['foo', 'bar'] as const, required: true },
				});
				const test4: Equals<
					InferDocumentObject<typeof schema4>,
					{ stringProp: 'foo' | 'bar' }
				> = true;
				expect(test4).toBe(true);
			});

			test('should infer number type', () => {
				// not required should be nullable
				const schema1 = new Schema({ numberProp: { type: 'number', path: '1' } });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ numberProp: number | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ numberProp: { type: 'number', path: '1', required: true } });
				const test2: Equals<InferDocumentObject<typeof schema2>, { numberProp: number }> = true;
				expect(test2).toBe(true);
			});

			test('should infer boolean type', () => {
				// not required should be nullable
				const schema1 = new Schema({ booleanProp: { type: 'boolean', path: '1' } });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ booleanProp: boolean | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ booleanProp: { type: 'boolean', path: '1', required: true } });
				const test2: Equals<InferDocumentObject<typeof schema2>, { booleanProp: boolean }> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOCalendarDate type', () => {
				// not required should be nullable
				const schema1 = new Schema({ isoCalendarDateProp: { type: 'ISOCalendarDate', path: '1' } });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ isoCalendarDateProp: ISOCalendarDate | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					isoCalendarDateProp: { type: 'ISOCalendarDate', path: '1', required: true },
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ isoCalendarDateProp: ISOCalendarDate }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOTime type', () => {
				// not required should be nullable
				const schema1 = new Schema({ isoTimeProp: { type: 'ISOTime', path: '1' } });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ isoTimeProp: ISOTime | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ isoTimeProp: { type: 'ISOTime', path: '1', required: true } });
				const test2: Equals<InferDocumentObject<typeof schema2>, { isoTimeProp: ISOTime }> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOCalendarDateTime type', () => {
				// not required should be nullable
				const schema1 = new Schema({
					isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '1' },
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{
						isoCalendarDateTimeProp: ISOCalendarDateTime | null;
					}
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '1', required: true },
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{
						isoCalendarDateTimeProp: ISOCalendarDateTime;
					}
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('embedded', () => {
			test('should infer nested schema', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: new Schema({ innerEmbeddedProp: { type: 'string', path: '1' } }),
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ embeddedProp: { innerEmbeddedProp: string | null } }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: new Schema({
						innerEmbeddedProp: { type: 'string', path: '1', required: true },
					}),
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ embeddedProp: { innerEmbeddedProp: string } }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer nested definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: { innerEmbeddedProp: { type: 'string', path: '1' } },
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ embeddedProp: { innerEmbeddedProp: string | null } }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: { innerEmbeddedProp: { type: 'string', path: '1', required: true } },
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ embeddedProp: { innerEmbeddedProp: string } }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer multi-level embedded definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: {
						innerEmbeddedProp: {
							deepEmbeddedProp: { type: 'string', path: '1' },
						},
					},
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ embeddedProp: { innerEmbeddedProp: { deepEmbeddedProp: string | null } } }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: {
						innerEmbeddedProp: {
							deepEmbeddedProp: { type: 'string', path: '1', required: true },
						},
					},
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ embeddedProp: { innerEmbeddedProp: { deepEmbeddedProp: string } } }
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('arrays', () => {
			test('should infer scalar array', () => {
				// not required should be nullable
				const schema1 = new Schema({ arrayProp: [{ type: 'string', path: '1' }] });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ arrayProp: (string | null)[] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ arrayProp: [{ type: 'string', path: '1', required: true }] });
				const test2: Equals<InferDocumentObject<typeof schema2>, { arrayProp: string[] }> = true;
				expect(test2).toBe(true);
			});

			test('should infer nested array', () => {
				// not required should be nullable
				const schema1 = new Schema({ nestedArrayProp: [[{ type: 'string', path: '1' }]] });
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ nestedArrayProp: (string | null)[][] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					nestedArrayProp: [[{ type: 'string', path: '1', required: true }]],
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ nestedArrayProp: string[][] }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer document array from definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					documentArrayProp: [
						{
							docStringProp: { type: 'string', path: '1' },
							docNumberProp: { type: 'number', path: '2' },
						},
					],
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ documentArrayProp: { docStringProp: string | null; docNumberProp: number | null }[] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					documentArrayProp: [
						{
							docStringProp: { type: 'string', path: '1', required: true },
							docNumberProp: { type: 'number', path: '2' },
						},
					],
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ documentArrayProp: { docStringProp: string; docNumberProp: number | null }[] }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer document array from schema', () => {
				// not required should be nullable
				const schema1 = new Schema({
					documentArraySchemaProp: [new Schema({ docStringProp: { type: 'string', path: '1' } })],
				});
				const test1: Equals<
					InferDocumentObject<typeof schema1>,
					{ documentArraySchemaProp: { docStringProp: string | null }[] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					documentArraySchemaProp: [
						new Schema({ docStringProp: { type: 'string', path: '1', required: true } }),
					],
				});
				const test2: Equals<
					InferDocumentObject<typeof schema2>,
					{ documentArraySchemaProp: { docStringProp: string }[] }
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('combination', () => {
			test('should infer mixed schema', () => {
				const schema = new Schema({
					booleanOptional: { type: 'boolean', path: '1' },
					booleanRequired: { type: 'boolean', path: '2', required: true },
					stringOptional: { type: 'string', path: '3' },
					stringRequired: { type: 'string', path: '4', required: true },
					numberOptional: { type: 'number', path: '5' },
					numberRequired: { type: 'number', path: '6', required: true },
					isoCalendarDateOptional: { type: 'ISOCalendarDate', path: '7' },
					isoCalendarDateRequired: { type: 'ISOCalendarDate', path: '8', required: true },
					isoTimeOptional: { type: 'ISOTime', path: '9' },
					isoTimeRequired: { type: 'ISOTime', path: '10', required: true },
					isoCalendarDateTimeOptional: { type: 'ISOCalendarDateTime', path: '11' },
					isoCalendarDateTimeRequired: { type: 'ISOCalendarDateTime', path: '12', required: true },
					arrayOptional: [{ type: 'string', path: '13' }],
					arrayRequired: [{ type: 'string', path: '14', required: true }],
					nestedArrayOptional: [[{ type: 'string', path: '15' }]],
					nestedArrayRequired: [[{ type: 'string', path: '16', required: true }]],
					embeddedOptional: new Schema({
						innerEmbeddedProp: { type: 'string', path: '17' },
					}),
					embeddedRequired: new Schema({
						innerEmbeddedProp: { type: 'string', path: '18', required: true },
					}),
					documentArrayOptional: [
						{
							docStringProp: { type: 'string', path: '19' },
							docNumberProp: { type: 'number', path: '20' },
						},
					],
					documentArrayRequired: [
						{
							docStringProp: { type: 'string', path: '21', required: true },
							docNumberProp: { type: 'number', path: '22' },
						},
					],
					documentArraySchemaOptional: [
						new Schema({
							docStringProp: { type: 'string', path: '23' },
						}),
					],
					documentArraySchemaRequired: [
						new Schema({
							docStringProp: { type: 'string', path: '24', required: true },
						}),
					],
				});

				const test1: Equals<
					InferDocumentObject<typeof schema>,
					{
						booleanOptional: boolean | null;
						booleanRequired: boolean;
						stringOptional: string | null;
						stringRequired: string;
						numberOptional: number | null;
						numberRequired: number;
						isoCalendarDateOptional: ISOCalendarDate | null;
						isoCalendarDateRequired: ISOCalendarDate;
						isoTimeOptional: ISOTime | null;
						isoTimeRequired: ISOTime;
						isoCalendarDateTimeOptional: ISOCalendarDateTime | null;
						isoCalendarDateTimeRequired: ISOCalendarDateTime;
						arrayOptional: (string | null)[];
						arrayRequired: string[];
						nestedArrayOptional: (string | null)[][];
						nestedArrayRequired: string[][];
						embeddedOptional: { innerEmbeddedProp: string | null };
						embeddedRequired: { innerEmbeddedProp: string };
						documentArrayOptional: { docStringProp: string | null; docNumberProp: number | null }[];
						documentArrayRequired: { docStringProp: string; docNumberProp: number | null }[];
						documentArraySchemaOptional: { docStringProp: string | null }[];
						documentArraySchemaRequired: { docStringProp: string }[];
					}
				> = true;
				expect(test1).toBe(true);
			});
		});

		describe('null schema', () => {
			test('should have the _raw property', () => {
				const test1: Equals<InferDocumentObject<null>, { _raw: MvRecord }> = true;
				expect(test1).toBe(true);
			});
		});
	});

	describe('InferModelObject', () => {
		describe('scalars', () => {
			test('should infer string type', () => {
				// not required should be nullable
				const schema1 = new Schema({ stringProp: { type: 'string', path: '1' } });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; stringProp: string | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ stringProp: { type: 'string', path: '1', required: true } });
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; stringProp: string }
				> = true;
				expect(test2).toBe(true);

				// not required enum should be union of enum values and null
				const schema3 = new Schema({
					stringProp: { type: 'string', path: '1', enum: ['foo', 'bar'] as const },
				});
				const test3: Equals<
					InferModelObject<typeof schema3>,
					{ _id: string; __v: string; stringProp: 'foo' | 'bar' | null }
				> = true;
				expect(test3).toBe(true);

				// required enum should not be nullable
				const schema4 = new Schema({
					stringProp: { type: 'string', path: '1', enum: ['foo', 'bar'] as const, required: true },
				});
				const test4: Equals<
					InferModelObject<typeof schema4>,
					{ _id: string; __v: string; stringProp: 'foo' | 'bar' }
				> = true;
				expect(test4).toBe(true);
			});

			test('should infer number type', () => {
				// not required should be nullable
				const schema1 = new Schema({ numberProp: { type: 'number', path: '1' } });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; numberProp: number | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ numberProp: { type: 'number', path: '1', required: true } });
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; numberProp: number }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer boolean type', () => {
				// not required should be nullable
				const schema1 = new Schema({ booleanProp: { type: 'boolean', path: '1' } });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; booleanProp: boolean | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ booleanProp: { type: 'boolean', path: '1', required: true } });
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; booleanProp: boolean }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOCalendarDate type', () => {
				// not required should be nullable
				const schema1 = new Schema({ isoCalendarDateProp: { type: 'ISOCalendarDate', path: '1' } });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; isoCalendarDateProp: ISOCalendarDate | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					isoCalendarDateProp: { type: 'ISOCalendarDate', path: '1', required: true },
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; isoCalendarDateProp: ISOCalendarDate }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOTime type', () => {
				// not required should be nullable
				const schema1 = new Schema({ isoTimeProp: { type: 'ISOTime', path: '1' } });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; isoTimeProp: ISOTime | null }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ isoTimeProp: { type: 'ISOTime', path: '1', required: true } });
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; isoTimeProp: ISOTime }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer ISOCalendarDateTime type', () => {
				// not required should be nullable
				const schema1 = new Schema({
					isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '1' },
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{
						_id: string;
						__v: string;
						isoCalendarDateTimeProp: ISOCalendarDateTime | null;
					}
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					isoCalendarDateTimeProp: { type: 'ISOCalendarDateTime', path: '1', required: true },
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{
						_id: string;
						__v: string;
						isoCalendarDateTimeProp: ISOCalendarDateTime;
					}
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('embedded', () => {
			test('should infer nested schema', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: new Schema({ innerEmbeddedProp: { type: 'string', path: '1' } }),
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; embeddedProp: { innerEmbeddedProp: string | null } }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: new Schema({
						innerEmbeddedProp: { type: 'string', path: '1', required: true },
					}),
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; embeddedProp: { innerEmbeddedProp: string } }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer nested definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: { innerEmbeddedProp: { type: 'string', path: '1' } },
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; embeddedProp: { innerEmbeddedProp: string | null } }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: { innerEmbeddedProp: { type: 'string', path: '1', required: true } },
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; embeddedProp: { innerEmbeddedProp: string } }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer multi-level embedded definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					embeddedProp: {
						innerEmbeddedProp: {
							deepEmbeddedProp: { type: 'string', path: '1' },
						},
					},
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{
						_id: string;
						__v: string;
						embeddedProp: { innerEmbeddedProp: { deepEmbeddedProp: string | null } };
					}
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					embeddedProp: {
						innerEmbeddedProp: {
							deepEmbeddedProp: { type: 'string', path: '1', required: true },
						},
					},
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{
						_id: string;
						__v: string;
						embeddedProp: { innerEmbeddedProp: { deepEmbeddedProp: string } };
					}
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('arrays', () => {
			test('should infer scalar array', () => {
				// not required should be nullable
				const schema1 = new Schema({ arrayProp: [{ type: 'string', path: '1' }] });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; arrayProp: (string | null)[] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({ arrayProp: [{ type: 'string', path: '1', required: true }] });
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; arrayProp: string[] }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer nested array', () => {
				// not required should be nullable
				const schema1 = new Schema({ nestedArrayProp: [[{ type: 'string', path: '1' }]] });
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; nestedArrayProp: (string | null)[][] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					nestedArrayProp: [[{ type: 'string', path: '1', required: true }]],
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; nestedArrayProp: string[][] }
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer document array from definition', () => {
				// not required should be nullable
				const schema1 = new Schema({
					documentArrayProp: [
						{
							docStringProp: { type: 'string', path: '1' },
							docNumberProp: { type: 'number', path: '2' },
						},
					],
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{
						_id: string;
						__v: string;
						documentArrayProp: { docStringProp: string | null; docNumberProp: number | null }[];
					}
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					documentArrayProp: [
						{
							docStringProp: { type: 'string', path: '1', required: true },
							docNumberProp: { type: 'number', path: '2' },
						},
					],
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{
						_id: string;
						__v: string;
						documentArrayProp: { docStringProp: string; docNumberProp: number | null }[];
					}
				> = true;
				expect(test2).toBe(true);
			});

			test('should infer document array from schema', () => {
				// not required should be nullable
				const schema1 = new Schema({
					documentArraySchemaProp: [new Schema({ docStringProp: { type: 'string', path: '1' } })],
				});
				const test1: Equals<
					InferModelObject<typeof schema1>,
					{ _id: string; __v: string; documentArraySchemaProp: { docStringProp: string | null }[] }
				> = true;
				expect(test1).toBe(true);

				// required should not be nullable
				const schema2 = new Schema({
					documentArraySchemaProp: [
						new Schema({ docStringProp: { type: 'string', path: '1', required: true } }),
					],
				});
				const test2: Equals<
					InferModelObject<typeof schema2>,
					{ _id: string; __v: string; documentArraySchemaProp: { docStringProp: string }[] }
				> = true;
				expect(test2).toBe(true);
			});
		});

		describe('combination', () => {
			test('should infer mixed schema', () => {
				const schema = new Schema({
					booleanOptional: { type: 'boolean', path: '1' },
					booleanRequired: { type: 'boolean', path: '2', required: true },
					stringOptional: { type: 'string', path: '3' },
					stringRequired: { type: 'string', path: '4', required: true },
					numberOptional: { type: 'number', path: '5' },
					numberRequired: { type: 'number', path: '6', required: true },
					isoCalendarDateOptional: { type: 'ISOCalendarDate', path: '7' },
					isoCalendarDateRequired: { type: 'ISOCalendarDate', path: '8', required: true },
					isoTimeOptional: { type: 'ISOTime', path: '9' },
					isoTimeRequired: { type: 'ISOTime', path: '10', required: true },
					isoCalendarDateTimeOptional: { type: 'ISOCalendarDateTime', path: '11' },
					isoCalendarDateTimeRequired: { type: 'ISOCalendarDateTime', path: '12', required: true },
					arrayOptional: [{ type: 'string', path: '13' }],
					arrayRequired: [{ type: 'string', path: '14', required: true }],
					nestedArrayOptional: [[{ type: 'string', path: '15' }]],
					nestedArrayRequired: [[{ type: 'string', path: '16', required: true }]],
					embeddedOptional: new Schema({
						innerEmbeddedProp: { type: 'string', path: '17' },
					}),
					embeddedRequired: new Schema({
						innerEmbeddedProp: { type: 'string', path: '18', required: true },
					}),
					documentArrayOptional: [
						{
							docStringProp: { type: 'string', path: '19' },
							docNumberProp: { type: 'number', path: '20' },
						},
					],
					documentArrayRequired: [
						{
							docStringProp: { type: 'string', path: '21', required: true },
							docNumberProp: { type: 'number', path: '22' },
						},
					],
					documentArraySchemaOptional: [
						new Schema({
							docStringProp: { type: 'string', path: '23' },
						}),
					],
					documentArraySchemaRequired: [
						new Schema({
							docStringProp: { type: 'string', path: '24', required: true },
						}),
					],
				});

				const test1: Equals<
					InferModelObject<typeof schema>,
					{
						_id: string;
						__v: string;
						booleanOptional: boolean | null;
						booleanRequired: boolean;
						stringOptional: string | null;
						stringRequired: string;
						numberOptional: number | null;
						numberRequired: number;
						isoCalendarDateOptional: ISOCalendarDate | null;
						isoCalendarDateRequired: ISOCalendarDate;
						isoTimeOptional: ISOTime | null;
						isoTimeRequired: ISOTime;
						isoCalendarDateTimeOptional: ISOCalendarDateTime | null;
						isoCalendarDateTimeRequired: ISOCalendarDateTime;
						arrayOptional: (string | null)[];
						arrayRequired: string[];
						nestedArrayOptional: (string | null)[][];
						nestedArrayRequired: string[][];
						embeddedOptional: { innerEmbeddedProp: string | null };
						embeddedRequired: { innerEmbeddedProp: string };
						documentArrayOptional: { docStringProp: string | null; docNumberProp: number | null }[];
						documentArrayRequired: { docStringProp: string; docNumberProp: number | null }[];
						documentArraySchemaOptional: { docStringProp: string | null }[];
						documentArraySchemaRequired: { docStringProp: string }[];
					}
				> = true;
				expect(test1).toBe(true);
			});
		});

		describe('null schema', () => {
			test('should have the _raw property', () => {
				const test1: Equals<
					InferModelObject<null>,
					{ _id: string; __v: string; _raw: MvRecord }
				> = true;
				expect(test1).toBe(true);
			});
		});
	});

	describe('FlattenDocument', () => {
		test('should flatten document types from mixed schema', () => {
			const schema = new Schema({
				booleanOptional: { type: 'boolean', path: '1' },
				booleanRequired: { type: 'boolean', path: '2', required: true },
				stringOptional: { type: 'string', path: '3' },
				stringRequired: { type: 'string', path: '4', required: true },
				numberOptional: { type: 'number', path: '5' },
				numberRequired: { type: 'number', path: '6', required: true },
				isoCalendarDateOptional: { type: 'ISOCalendarDate', path: '7' },
				isoCalendarDateRequired: { type: 'ISOCalendarDate', path: '8', required: true },
				isoTimeOptional: { type: 'ISOTime', path: '9' },
				isoTimeRequired: { type: 'ISOTime', path: '10', required: true },
				isoCalendarDateTimeOptional: { type: 'ISOCalendarDateTime', path: '11' },
				isoCalendarDateTimeRequired: { type: 'ISOCalendarDateTime', path: '12', required: true },
				arrayOptional: [{ type: 'string', path: '13' }],
				arrayRequired: [{ type: 'string', path: '14', required: true }],
				nestedArrayOptional: [[{ type: 'string', path: '15' }]],
				nestedArrayRequired: [[{ type: 'string', path: '16', required: true }]],
				embeddedOptional: new Schema({
					innerEmbeddedProp: { type: 'string', path: '17' },
				}),
				embeddedRequired: new Schema({
					innerEmbeddedProp: { type: 'string', path: '18', required: true },
				}),
				documentArrayOptional: [
					{
						docStringProp: { type: 'string', path: '19' },
						docNumberProp: { type: 'number', path: '20' },
					},
				],
				documentArrayRequired: [
					{
						docStringProp: { type: 'string', path: '21', required: true },
						docNumberProp: { type: 'number', path: '22' },
					},
				],
				documentArraySchemaOptional: [
					new Schema({
						docStringProp: { type: 'string', path: '23' },
					}),
				],
				documentArraySchemaRequired: [
					new Schema({
						docStringProp: { type: 'string', path: '24', required: true },
					}),
				],
			});

			const test1: Equals<
				FlattenDocument<typeof schema>,
				{
					booleanOptional: boolean | null;
					booleanRequired: boolean;
					stringOptional: string | null;
					stringRequired: string;
					numberOptional: number | null;
					numberRequired: number;
					isoCalendarDateOptional: ISOCalendarDate | null;
					isoCalendarDateRequired: ISOCalendarDate;
					isoTimeOptional: ISOTime | null;
					isoTimeRequired: ISOTime;
					isoCalendarDateTimeOptional: ISOCalendarDateTime | null;
					isoCalendarDateTimeRequired: ISOCalendarDateTime;
					arrayOptional: string | null;
					arrayRequired: string;
					nestedArrayOptional: string | null;
					nestedArrayRequired: string;
					'embeddedOptional.innerEmbeddedProp': string | null;
					'embeddedRequired.innerEmbeddedProp': string;
					'documentArrayOptional.docStringProp': string | null;
					'documentArrayOptional.docNumberProp': number | null;
					'documentArrayRequired.docStringProp': string;
					'documentArrayRequired.docNumberProp': number | null;
					'documentArraySchemaOptional.docStringProp': string | null;
					'documentArraySchemaRequired.docStringProp': string;
				}
			> = true;
			expect(test1).toBe(true);
		});
	});

	describe('InferSchemaPaths', () => {
		test('should infer paths from mixed schema', () => {
			const schema = new Schema({
				booleanOptional: { type: 'boolean', path: '1' },
				booleanRequired: { type: 'boolean', path: '2', required: true },
				stringOptional: { type: 'string', path: '3' },
				stringRequired: { type: 'string', path: '4', required: true },
				numberOptional: { type: 'number', path: '5' },
				numberRequired: { type: 'number', path: '6', required: true },
				isoCalendarDateOptional: { type: 'ISOCalendarDate', path: '7' },
				isoCalendarDateRequired: { type: 'ISOCalendarDate', path: '8', required: true },
				isoTimeOptional: { type: 'ISOTime', path: '9' },
				isoTimeRequired: { type: 'ISOTime', path: '10', required: true },
				isoCalendarDateTimeOptional: { type: 'ISOCalendarDateTime', path: '11' },
				isoCalendarDateTimeRequired: { type: 'ISOCalendarDateTime', path: '12', required: true },
				arrayOptional: [{ type: 'string', path: '13' }],
				arrayRequired: [{ type: 'string', path: '14', required: true }],
				nestedArrayOptional: [[{ type: 'string', path: '15' }]],
				nestedArrayRequired: [[{ type: 'string', path: '16', required: true }]],
				embeddedOptional: new Schema({
					innerEmbeddedProp: { type: 'string', path: '17' },
				}),
				embeddedRequired: new Schema({
					innerEmbeddedProp: { type: 'string', path: '18', required: true },
				}),
				documentArrayOptional: [
					{
						docStringProp: { type: 'string', path: '19' },
						docNumberProp: { type: 'number', path: '20' },
					},
				],
				documentArrayRequired: [
					{
						docStringProp: { type: 'string', path: '21', required: true },
						docNumberProp: { type: 'number', path: '22' },
					},
				],
				documentArraySchemaOptional: [
					new Schema({
						docStringProp: { type: 'string', path: '23' },
					}),
				],
				documentArraySchemaRequired: [
					new Schema({
						docStringProp: { type: 'string', path: '24', required: true },
					}),
				],
			});

			const test1: Equals<
				InferSchemaPaths<typeof schema>,
				| 'booleanOptional'
				| 'booleanRequired'
				| 'stringOptional'
				| 'stringRequired'
				| 'numberOptional'
				| 'numberRequired'
				| 'isoCalendarDateOptional'
				| 'isoCalendarDateRequired'
				| 'isoTimeOptional'
				| 'isoTimeRequired'
				| 'isoCalendarDateTimeOptional'
				| 'isoCalendarDateTimeRequired'
				| 'arrayOptional'
				| 'arrayRequired'
				| 'nestedArrayOptional'
				| 'nestedArrayRequired'
				| 'embeddedOptional.innerEmbeddedProp'
				| 'embeddedRequired.innerEmbeddedProp'
				| 'documentArrayOptional.docStringProp'
				| 'documentArrayOptional.docNumberProp'
				| 'documentArrayRequired.docStringProp'
				| 'documentArrayRequired.docNumberProp'
				| 'documentArraySchemaOptional.docStringProp'
				| 'documentArraySchemaRequired.docStringProp'
			> = true;
			expect(test1).toBe(true);
		});
	});
});
