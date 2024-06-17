import mockDelimiters from '#test/mockDelimiters';
import type { BuildForeignKeyDefinitionsResult, DocumentConstructorOptions } from '../Document';
import Document from '../Document';
import { TransformDataError } from '../errors';
import type { SchemaDefinition } from '../Schema';
import Schema from '../Schema';
import type { MvRecord } from '../types';

const { am, vm, svm } = mockDelimiters;

class DocumentSubclass<
	TSchema extends Schema<TSchemaDefinition> | null,
	TSchemaDefinition extends SchemaDefinition,
> extends Document<TSchema, TSchemaDefinition> {
	public constructor(
		schema: TSchema,
		options: DocumentConstructorOptions<TSchema, TSchemaDefinition>,
	) {
		super(schema, options);
	}
}

describe('constructor', () => {
	test('should construct a document from supplied data', () => {
		const schema = new Schema({
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		});
		const document = new DocumentSubclass(schema, { data: { prop1: 'foo', prop2: 1.23 } });

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(1.23);
	});

	test('should construct a document with a raw property if no schema is supplied', () => {
		const document = new DocumentSubclass(null, { record: ['foo', '123'] });

		expect(document._raw).toEqual(['foo', '123']);
	});

	test('should update transformationErrors array if data cannot be cast to schema type', () => {
		const schema = new Schema({
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		});
		const document = new DocumentSubclass(schema, { record: ['foo', 'bar'] });

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBeNull();
		expect(document._transformationErrors).toHaveLength(1);
		expect(document._transformationErrors[0]).toBeInstanceOf(TransformDataError);
	});

	test('should throw error during Document construction if schemaType.get throws any error other than TransformDataError', async () => {
		// mock NumberType.get to throw
		jest.resetModules();
		const err = new Error();
		const getMock = jest.fn().mockImplementation(() => {
			throw err;
		});
		jest.doMock('../schemaType/NumberType', () => jest.fn(() => ({ get: getMock })));
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { default: TestSchema } = await import('../Schema');

		const schema = new TestSchema({
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		});

		expect(() => {
			new DocumentSubclass(schema, { record: ['foo', '123'] });
		}).toThrow(err);
	});
});

describe('createSubdocumentFromRecord', () => {
	test('should create a new subdocument from the provided record', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '3' },
			prop2: { type: 'number', path: '4', dbDecimals: 2 },
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unused',
			'unused',
			'foo',
			'123',
		]);

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(1.23);
	});

	test('should create a new subdocument from the provided record with array schema properties', () => {
		const definition: SchemaDefinition = {
			arrayProp: [{ type: 'string', path: '3' }],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unused',
			'unused',
			['foo', 'bar'],
			'unused',
			'unused',
		]);

		expect(document.arrayProp).toEqual(['foo', 'bar']);
	});

	test('should create a new subdocument from the provided record with array schema properties and sparse arrays', () => {
		const definition: SchemaDefinition = {
			arrayProp: [{ type: 'string', path: '3' }],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unused',
			'unused',
			[null, 'bar'],
			'unused',
			'unused',
		]);

		expect(document.arrayProp).toEqual([null, 'bar']);
	});

	test('should create a new subdocument from the provided record with nested array schema properties', () => {
		const definition: SchemaDefinition = {
			nestedArrayProp: [[{ type: 'string', path: '3' }]],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unused',
			'unused',
			[
				['foo', 'bar'],
				['baz', 'qux'],
			],
			'unused',
			'unused',
		]);

		expect(document.nestedArrayProp).toEqual([
			['foo', 'bar'],
			['baz', 'qux'],
		]);
	});

	test('should create a new subdocument from the provided record with nested array schema properties and sparse arrays', () => {
		const definition: SchemaDefinition = {
			nestedArrayProp: [[{ type: 'string', path: '3' }]],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unused',
			'unused',
			[
				[null, 'bar'],
				['baz', null],
			],
			'unused',
			'unused',
		]);

		expect(document.nestedArrayProp).toEqual([
			[null, 'bar'],
			['baz', null],
		]);
	});

	test('should create a new subdocument with a subdocument array from the provided record', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '3' },
					prop2: { type: 'number', path: '4', dbDecimals: 2 },
					prop3: [{ type: 'string', path: '5' }],
				},
			],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			null,
			null,
			['foo', 'bar'],
			['123', '456'],
			[
				['val1', 'val2'],
				['val3', 'val4'],
			],
			'unused',
			'unused',
		]);

		const expected = [
			{ prop1: 'foo', prop2: 1.23, prop3: ['val1', 'val2'] },
			{ prop1: 'bar', prop2: 4.56, prop3: ['val3', 'val4'] },
		];

		expect(document.subdocumentArray).toEqual(expected);
	});

	test('should create a new subdocument with a subdocument array from the provided record and sparse arrays', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '3' },
					prop2: { type: 'number', path: '4', dbDecimals: 2 },
					prop3: [{ type: 'string', path: '5' }],
				},
			],
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			null,
			null,
			[null, 'bar'],
			['123', null],
			[
				[null, 'val2'],
				['val3', null],
			],
			'unused',
			'unused',
		]);

		const expected = [
			{ prop1: null, prop2: 1.23, prop3: [null, 'val2'] },
			{ prop1: 'bar', prop2: null, prop3: ['val3', null] },
		];

		expect(document.subdocumentArray).toEqual(expected);
	});
});

describe('createSubdocumentFromData', () => {
	test('should create a new subdocument from the provided data', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromData(schema, { prop1: 'foo', prop2: 1.23 });

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(1.23);
	});
});

describe('createDocumentFromRecordString', () => {
	test('should create a new document from the provided record string', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '3' },
			prop2: { type: 'number', path: '4', dbDecimals: 2 },
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}foo${am}123`,
			mockDelimiters,
		);

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(1.23);
	});

	test('should create a new document with an array from the provided record string', () => {
		const definition: SchemaDefinition = {
			arrayProp: [{ type: 'string', path: '3' }],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}foo${vm}bar${vm}baz${am}unused${am}unused`,
			mockDelimiters,
		);

		expect(document.arrayProp).toEqual(['foo', 'bar', 'baz']);
	});

	test('should create a new document with an array from the provided record string with sparse data', () => {
		const definition: SchemaDefinition = {
			arrayProp: [{ type: 'string', path: '3' }],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}foo${vm}${vm}baz${am}unused${am}unused`,
			mockDelimiters,
		);

		expect(document.arrayProp).toEqual(['foo', null, 'baz']);
	});

	test('should create a new document with a nested array from the provided record string', () => {
		const definition: SchemaDefinition = {
			nestedArrayProp: [[{ type: 'string', path: '3' }]],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}foo${svm}bar${vm}baz${svm}qux${am}unused${am}unused`,
			mockDelimiters,
		);

		expect(document.nestedArrayProp).toEqual([
			['foo', 'bar'],
			['baz', 'qux'],
		]);
	});

	test('should create a new document with a nested array from the provided record string with sparse data', () => {
		const definition: SchemaDefinition = {
			nestedArrayProp: [[{ type: 'string', path: '3' }]],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}${svm}bar${vm}baz${svm}${am}unused${am}unused`,
			mockDelimiters,
		);

		expect(document.nestedArrayProp).toEqual([
			[null, 'bar'],
			['baz', null],
		]);
	});

	test('should create a new document with a subdocument array from the provided record string', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '3' },
					prop2: { type: 'number', path: '4', dbDecimals: 2 },
					prop3: [{ type: 'string', path: '5' }],
				},
			],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}foo${vm}bar${am}123${vm}456${am}val1${svm}val2${vm}val3${svm}val4${am}unused${am}unused`,
			mockDelimiters,
		);

		const expected = [
			{ prop1: 'foo', prop2: 1.23, prop3: ['val1', 'val2'] },
			{ prop1: 'bar', prop2: 4.56, prop3: ['val3', 'val4'] },
		];

		expect(document.subdocumentArray).toEqual(expected);
	});

	test('should create a new document with a subdocument array from the provided record string with sparse data', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '3' },
					prop2: { type: 'number', path: '4', dbDecimals: 2 },
					prop3: [{ type: 'string', path: '5' }],
				},
			],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`unused${am}unused${am}${vm}bar${am}123${vm}${am}${svm}val2${vm}val3${svm}${am}unused${am}unused`,
			mockDelimiters,
		);

		const expected = [
			{ prop1: null, prop2: 1.23, prop3: [null, 'val2'] },
			{ prop1: 'bar', prop2: null, prop3: ['val3', null] },
		];

		expect(document.subdocumentArray).toEqual(expected);
	});

	test('should create a new document from the provided record string containing only values', () => {
		const definition: SchemaDefinition = {
			prop1: [{ type: 'string', path: '1' }],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`foo${vm}bar${vm}baz`,
			mockDelimiters,
		);

		expect(document.prop1).toEqual(['foo', 'bar', 'baz']);
	});

	test('should create a new document from the provided record string containing only subvalues', () => {
		const definition: SchemaDefinition = {
			prop1: [[{ type: 'string', path: '1' }]],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`foo${svm}bar${svm}baz`,
			mockDelimiters,
		);

		expect(document.prop1).toEqual([['foo', 'bar', 'baz']]);
	});

	test('should create a new document from the provided record string using document arrays at subvalue positions', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '1.1' },
					prop2: { type: 'number', path: '1.2', dbDecimals: 2 },
				},
			],
		};
		const schema = new Schema(definition);

		const document = Document.createDocumentFromRecordString(
			schema,
			`foo${svm}bar${vm}123${svm}456`,
			mockDelimiters,
		);

		const expected = [
			{ prop1: 'foo', prop2: 1.23 },
			{ prop1: 'bar', prop2: 4.56 },
		];
		expect(document.subdocumentArray).toEqual(expected);
	});
});

describe('transformDocumentToRecord', () => {
	test('should transform "raw" document to record', () => {
		const document = new DocumentSubclass(null, { record: ['foo', ['bar', 'baz']] });

		expect(document.transformDocumentToRecord()).toEqual(['foo', ['bar', 'baz']]);
	});

	test('should transform document with schema to record', () => {
		const definition = {
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
			array: [{ type: 'string', path: '3' }],
			nestedArray: [[{ type: 'string', path: '4' }]],
			nestedObject: {
				prop1: { type: 'string', path: '5' },
				prop2: { type: 'number', path: '6', dbDecimals: 2 },
			},
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '7' },
					prop2: { type: 'number', path: '8', dbDecimals: 2 },
				},
			],
		} satisfies SchemaDefinition;
		const schema = new Schema(definition);

		const data = {
			prop1: 'foo',
			prop2: 1.23,
			array: ['bar', 'baz'],
			nestedArray: [['qux', 'quux'], ['quz']],
			nestedObject: { prop1: 'corge', prop2: 2.34 },
			subdocumentArray: [
				{ prop1: 'grault', prop2: 3.45 },
				{ prop1: 'thud', prop2: 4.56 },
			],
		};
		const document = new DocumentSubclass(schema, { data });

		const expected: MvRecord = [
			'foo',
			'123',
			['bar', 'baz'],
			[['qux', 'quux'], ['quz']],
			'corge',
			'234',
			['grault', 'thud'],
			['345', '456'],
		];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});

	test('should transform document with schema to record if properties are not defined', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
			array: [{ type: 'string', path: '3' }],
			nestedArray: [[{ type: 'string', path: '4' }]],
			nestedObject: {
				prop1: { type: 'string', path: '5' },
				prop2: { type: 'number', path: '6', dbDecimals: 2 },
			},
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '7' },
					prop2: { type: 'number', path: '8', dbDecimals: 2 },
				},
			],
		};
		const schema = new Schema(definition);

		const data = {};
		const document = new DocumentSubclass(schema, { data });

		const expected: MvRecord = [null, null, [], [], null, null, null, null];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});

	test('should transform document with schema to record, retaining original record properties that are not mapped in schema', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '4', dbDecimals: 2 },
			array: [{ type: 'string', path: '6' }],
			nestedArray: [[{ type: 'string', path: '8' }]],
			nestedObject: {
				prop1: { type: 'string', path: '10' },
				prop2: { type: 'number', path: '12', dbDecimals: 2 },
			},
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '14' },
					prop2: { type: 'number', path: '16', dbDecimals: 2 },
				},
			],
		};
		const schema = new Schema(definition);

		const record = [
			'unmapped1',
			null,
			'unmapped2',
			null,
			'unmapped3',
			null,
			'unmapped4',
			null,
			'unmapped5',
			null,
			'unmapped6',
			null,
			'unmapped7',
			null,
			'unmapped8',
			null,
		];

		const document = new DocumentSubclass(schema, { record });
		document.prop1 = 'foo';
		document.prop2 = 1.23;
		document.array = ['bar', 'baz'];
		document.nestedArray = [['qux', 'quux'], 'quz'];
		document.nestedObject = { prop1: 'corge', prop2: 2.34 };
		document.subdocumentArray = [
			{ prop1: 'grault', prop2: 3.45 },
			{ prop1: 'thud', prop2: 4.56 },
		];

		const expected: MvRecord = [
			'unmapped1',
			'foo',
			'unmapped2',
			'123',
			'unmapped3',
			['bar', 'baz'],
			'unmapped4',
			[['qux', 'quux'], ['quz']],
			'unmapped5',
			'corge',
			'unmapped6',
			'234',
			'unmapped7',
			['grault', 'thud'],
			'unmapped8',
			['345', '456'],
		];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});

	test('should transform subdocument to record, leaving all unmapped positions as undefined', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '4', dbDecimals: 2 },
		};
		const schema = new Schema(definition);

		const document = Document.createSubdocumentFromRecord(schema, [
			'unmapped1',
			null,
			'unmapped2',
			null,
		]);
		document.prop1 = 'foo';
		document.prop2 = 1.23;

		const expected: MvRecord = [undefined, 'foo', undefined, '123'];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});

	test('should transform document arrays at subvalue position', () => {
		const definition: SchemaDefinition = {
			subdocumentArray: [
				{
					prop1: { type: 'string', path: '1.1' },
					prop2: { type: 'number', path: '1.2', dbDecimals: 2 },
				},
			],
		};
		const schema = new Schema(definition);

		const data = {
			subdocumentArray: [
				{ prop1: 'foo', prop2: 1.23 },
				{ prop1: 'bar', prop2: 4.56 },
			],
		};
		const document = new DocumentSubclass(schema, { data });

		const expected: MvRecord = [
			[
				['foo', 'bar'],
				['123', '456'],
			],
		];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});
});

describe('buildForeignKeyDefinitions', () => {
	test('should return empty array if schema is null', () => {
		const document = new DocumentSubclass(null, { record: [] });

		expect(document.buildForeignKeyDefinitions()).toEqual([]);
	});

	test('should build foreign key definitions for strings', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1', foreignKey: { entityName: 'entityName', file: 'FILE' } },
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, { data: { prop1: 'foo' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE'], entityName: 'entityName', entityIds: ['foo'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should build multiple foreign key definitions for strings', () => {
		const definition: SchemaDefinition = {
			prop1: {
				type: 'string',
				path: '1',
				foreignKey: { entityName: 'entityName1', file: 'FILE1' },
			},
			prop2: {
				type: 'string',
				path: '2',
				foreignKey: { entityName: 'entityName2', file: 'FILE2' },
			},
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, { data: { prop1: 'foo', prop2: 'bar' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE1'], entityName: 'entityName1', entityIds: ['foo'] },
			{ filename: ['FILE2'], entityName: 'entityName2', entityIds: ['bar'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should consolidate foreign keys for duplicate files', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1', foreignKey: { entityName: 'entityName', file: 'FILE' } },
			prop2: { type: 'string', path: '2', foreignKey: { entityName: 'entityName', file: 'FILE' } },
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, { data: { prop1: 'foo', prop2: 'bar' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE'], entityName: 'entityName', entityIds: ['foo', 'bar'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should create multiple foreign key definitions for array content', () => {
		const definition: SchemaDefinition = {
			prop1: [
				{ type: 'string', path: '1', foreignKey: { entityName: 'entityName', file: 'FILE' } },
			],
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, { data: { prop1: ['foo', 'bar'] } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE'], entityName: 'entityName', entityIds: ['foo', 'bar'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should create foreign key definitions for document array content', () => {
		const definition: SchemaDefinition = {
			documentArray: [
				{
					prop1: {
						type: 'string',
						path: '1',
						foreignKey: { entityName: 'entityName', file: 'FILE1' },
					},
					prop2: {
						type: 'string',
						path: '2',
						foreignKey: { entityName: 'entityName', file: 'FILE2' },
					},
				},
			],
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, {
			data: {
				documentArray: [
					{ prop1: 'foo', prop2: 'bar' },
					{ prop1: 'baz', prop2: 'qux' },
				],
			},
		});

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE1'], entityName: 'entityName', entityIds: ['foo', 'baz'] },
			{ filename: ['FILE2'], entityName: 'entityName', entityIds: ['bar', 'qux'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should build foreign key definitions for ids', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1' },
		};
		const schema = new Schema(definition, {
			idForeignKey: { entityName: 'entityName', file: 'FILE' },
		});

		const document = new DocumentSubclass(schema, { data: { _id: 'id', prop1: 'foo' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE'], entityName: 'entityName', entityIds: ['id'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should build foreign key definitions with multiple filenames', () => {
		const definition: SchemaDefinition = {
			prop1: {
				type: 'string',
				path: '1',
				foreignKey: { entityName: 'entityName', file: ['FILE1', 'FILE2'] },
			},
		};
		const schema = new Schema(definition);

		const document = new DocumentSubclass(schema, { data: { prop1: 'foo' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: ['FILE1', 'FILE2'], entityName: 'entityName', entityIds: ['foo'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});
});

describe('validate', () => {
	test('should return no errors if schema is null', async () => {
		const document = new DocumentSubclass(null, { record: [] });

		const expected = new Map();
		expect(await document.validate()).toEqual(expected);
	});

	describe('id matching validation', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1' },
		};
		const schema = new Schema(definition, {
			idMatch: /^foo$/,
		});

		test('should return error if id match is specified and id does not match pattern', async () => {
			const document = new DocumentSubclass(schema, { data: { _id: 'id', prop1: 'foo' } });

			const expected = new Map([['_id', ['Document id does not match pattern']]]);
			expect(await document.validate()).toEqual(expected);
		});

		test('should not return error if id match is specified and id matches pattern', async () => {
			const document = new DocumentSubclass(schema, { data: { _id: 'foo', prop1: 'foo' } });

			const expected = new Map();
			expect(await document.validate()).toEqual(expected);
		});
	});

	describe('schema type validation', () => {
		test('should return error at property if schemaType validation fails', async () => {
			const definition: SchemaDefinition = {
				prop1: { type: 'string', path: '1', required: true },
			};
			const schema = new Schema(definition);
			const document = new DocumentSubclass(schema, { record: [] });

			const expected = new Map([['prop1', ['Property is required']]]);
			expect(await document.validate()).toEqual(expected);
		});

		test('should not return error at property if schemaType validation is successful', async () => {
			const definition: SchemaDefinition = {
				prop1: { type: 'string', path: '1', required: true },
			};
			const schema = new Schema(definition);
			const document = new DocumentSubclass(schema, { record: ['foo'] });

			const expected = new Map();
			expect(await document.validate()).toEqual(expected);
		});

		test('should return thrown error message in an array if schemaType validation throws an error', async () => {
			// mock StringType.validate to throw
			jest.resetModules();
			const err = new Error('Test error message');
			const getMock = jest.fn().mockReturnValue(null);
			const castMock = jest.fn().mockImplementation((value) => value);
			const validateMock = jest.fn().mockImplementation(() => {
				throw err;
			});
			jest.doMock('../schemaType/StringType', () =>
				jest.fn(() => ({ get: getMock, cast: castMock, validate: validateMock })),
			);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const { default: TestSchema } = await import('../Schema');

			const schema = new TestSchema({
				prop1: { type: 'string', path: '1' },
			});
			const document = new DocumentSubclass(schema, { data: { prop1: 'foo' } });

			const expected = new Map([['prop1', ['Test error message']]]);
			expect(await document.validate()).toEqual(expected);
		});

		test('return error at property & unravel nested errors if schemaType validation fails', async () => {
			const passingSchema = new Schema({
				prop1: { type: 'string', path: '15', required: true },
				prop2: { type: 'number', path: '16', dbDecimals: 2, required: true },
			});
			const failingSchema = new Schema({
				prop1: [{ type: 'string', path: '17', required: true }],
				prop2: { type: 'number', path: '18', dbDecimals: 2, required: true },
			});

			const passingDocumentArraySchema = new Schema({
				prop1: [{ type: 'string', path: '19', required: true }],
				prop2: [{ type: 'number', path: '20', dbDecimals: 2, required: true }],
			});
			const failingDocumentArraySchema = new Schema({
				prop1: [{ type: 'string', path: '21', required: true }],
				prop2: { type: 'number', path: '22', dbDecimals: 2, required: true },
			});
			const definition: SchemaDefinition = {
				passingProp: { type: 'string', path: '1', required: true },
				failingProp: { type: 'number', path: '2', dbDecimals: 2, required: true },
				passingArray: [{ type: 'string', path: '3', required: true }],
				failingArray: [{ type: 'string', path: '4', required: true }],
				passingNestedArray: [[{ type: 'string', path: '5', required: true }]],
				failingNestedArray: [[{ type: 'string', path: '6', required: true }]],
				passingObject: {
					prop1: [{ type: 'number', path: '7', required: true }],
					prop2: { type: 'number', path: '8', required: true },
				},
				failingObject: {
					prop1: [{ type: 'number', path: '9', required: true }],
					prop2: { type: 'number', path: '10', required: true },
				},
				passingObjectArray: [
					{
						prop1: [{ type: 'string', path: '11', required: true }],
						prop2: { type: 'number', path: '12', dbDecimals: 2, required: true },
					},
				],
				failingObjectDocumentArray: [
					{
						prop1: [{ type: 'string', path: '13', required: true }],
						prop2: { type: 'number', path: '14', dbDecimals: 2, required: true },
					},
				],
				passingSchema,
				failingSchema,
				passingSchemaDocumentArray: [passingDocumentArraySchema],
				failingSchemaDocumentArray: [failingDocumentArraySchema],
			};
			const schema = new Schema(definition);
			const record = [
				'55', // passingProp
				null, // failingProp
				['foo', 'bar'], // passingArray
				[null, null], // failingArray
				[
					['bing', 'bong'],
					['bong', 'bing'],
				], // passingNestedArray
				[
					// failing nested array
					[null, 'yup'],
					['bong', 'hello', null],
					'hello',
					null,
				],
				['5', '10'], // passingObject.prop1
				'5', // passingObject.prop2
				[null, '5', null], // failingObject.prop1
				null, // failingObject.prop2
				[['5', '6']], // passingObjectDocumentArray.prop1
				[[`5`]], // passingObjectDocumentArray.prop2
				[
					// failingObjectDocumentArray.prop1
					['5', null, '5'],
					[null, '5', null],
				],
				['5', null], // failingObjectDocumentArray.prop2
				['5', '10'], // passingSchema.prop1
				'5', // passingSchema.prop2
				[null, '5', null], // failingSchema.prop1
				null, // failingSchema.prop2
				['5', '10'], // passingSchemaDocumentArray.prop1
				'5', // passingSchemaDocumentArray.prop2
				[
					[null, '5', null],
					['5', null, '5'],
				], // failingSchemaDocumentArray.prop1
				[null, null], // failingSchemaDocumentArray.prop2
			];
			const document = new DocumentSubclass(schema, {
				record,
			});

			const expected = new Map([
				['failingProp', ['Property is required']],
				['failingArray.0', ['Property is required']],
				['failingArray.1', ['Property is required']],
				['failingNestedArray.0.0', ['Property is required']],
				['failingNestedArray.1.2', ['Property is required']],
				['failingNestedArray.3.0', ['Property is required']],
				['failingObject.prop1.0', ['Property is required']],
				['failingObject.prop1.2', ['Property is required']],
				['failingObject.prop2', ['Property is required']],
				['failingObjectDocumentArray.0.prop1.1', ['Property is required']],
				['failingObjectDocumentArray.1.prop1.0', ['Property is required']],
				['failingObjectDocumentArray.1.prop1.2', ['Property is required']],
				['failingObjectDocumentArray.1.prop2', ['Property is required']],
				['failingObjectDocumentArray.1.prop2', ['Property is required']],
				['failingSchema.prop1.0', ['Property is required']],
				['failingSchema.prop1.2', ['Property is required']],
				['failingSchema.prop2', ['Property is required']],
				['failingSchemaDocumentArray.0.prop1.0', ['Property is required']],
				['failingSchemaDocumentArray.0.prop1.2', ['Property is required']],
				['failingSchemaDocumentArray.1.prop1.1', ['Property is required']],
				['failingSchemaDocumentArray.0.prop1.2', ['Property is required']],
				['failingSchemaDocumentArray.0.prop2', ['Property is required']],
				['failingSchemaDocumentArray.1.prop2', ['Property is required']],
			]);

			expect(await document.validate()).toEqual(expected);
		});
	});
});
