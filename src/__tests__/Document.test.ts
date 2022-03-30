import type { BuildForeignKeyDefinitionsResult } from '../Document';
import Document from '../Document';
import { TransformDataError } from '../errors';
import type { SchemaDefinition } from '../Schema';
import Schema from '../Schema';
import type { MvRecord } from '../types';

describe('constructor', () => {
	test('should construct a document from supplied data', () => {
		const schema = new Schema({
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		});
		const document = new Document(schema, { data: { prop1: 'foo', prop2: 1.23 } });

		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(1.23);
	});

	test('should construct a document with a raw property if no schema is supplied', () => {
		const document = new Document(null, { record: ['foo', '123'] });

		expect(document._raw).toEqual(['foo', '123']);
	});

	test('should update transformationErrors array if data cannot be cast to schema type', () => {
		const schema = new Schema({
			prop1: { type: 'string', path: '1' },
			prop2: { type: 'number', path: '2', dbDecimals: 2 },
		});
		const document = new Document(schema, { record: ['foo', 'bar'] });

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
			new Document(schema, { record: ['foo', '123'] });
		}).toThrow(err);
	});
});

describe('transformDocumentToRecord', () => {
	test('should transform "raw" document to record', () => {
		const document = new Document(null, { record: [] });

		document._raw = ['foo', ['bar', 'baz']];

		expect(document.transformDocumentToRecord()).toEqual(['foo', ['bar', 'baz']]);
	});

	test('should transform document with schema to record', () => {
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

		const data = {
			prop1: 'foo',
			prop2: 1.23,
			array: ['bar', 'baz'],
			nestedArray: [['qux', 'quux'], 'quz'],
			nestedObject: { prop1: 'corge', prop2: 2.34 },
			subdocumentArray: [
				{ prop1: 'grault', prop2: 3.45 },
				{ prop1: 'thud', prop2: 4.56 },
			],
		};
		const document = new Document(schema, { data });

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
		const document = new Document(schema, { data });

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

		const document = new Document(schema, { record });
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

		const document = new Document(schema, {
			isSubdocument: true,
			record: ['unmapped1', null, 'unmapped2', null],
		});
		document.prop1 = 'foo';
		document.prop2 = 1.23;

		const expected: MvRecord = [undefined, 'foo', undefined, '123'];
		expect(document.transformDocumentToRecord()).toEqual(expected);
	});
});

describe('buildForeignKeyDefinitions', () => {
	test('should return empty array if schema is null', () => {
		const document = new Document(null, { record: [] });

		expect(document.buildForeignKeyDefinitions()).toEqual([]);
	});

	test('should build foreign key definitions for strings', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1', foreignKey: { entityName: 'entityName', file: 'FILE' } },
		};
		const schema = new Schema(definition);

		const document = new Document(schema, { data: { prop1: 'foo' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE', entityName: 'entityName', entityIds: ['foo'] },
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

		const document = new Document(schema, { data: { prop1: 'foo', prop2: 'bar' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE1', entityName: 'entityName1', entityIds: ['foo'] },
			{ filename: 'FILE2', entityName: 'entityName2', entityIds: ['bar'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});

	test('should consolidate foreign keys for duplicate files', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '1', foreignKey: { entityName: 'entityName', file: 'FILE' } },
			prop2: { type: 'string', path: '2', foreignKey: { entityName: 'entityName', file: 'FILE' } },
		};
		const schema = new Schema(definition);

		const document = new Document(schema, { data: { prop1: 'foo', prop2: 'bar' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE', entityName: 'entityName', entityIds: ['foo', 'bar'] },
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

		const document = new Document(schema, { data: { prop1: ['foo', 'bar'] } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE', entityName: 'entityName', entityIds: ['foo', 'bar'] },
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

		const document = new Document(schema, {
			data: {
				documentArray: [
					{ prop1: 'foo', prop2: 'bar' },
					{ prop1: 'baz', prop2: 'qux' },
				],
			},
		});

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE1', entityName: 'entityName', entityIds: ['foo', 'baz'] },
			{ filename: 'FILE2', entityName: 'entityName', entityIds: ['bar', 'qux'] },
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

		const document = new Document(schema, { data: { _id: 'id', prop1: 'foo' } });

		const expected: BuildForeignKeyDefinitionsResult[] = [
			{ filename: 'FILE', entityName: 'entityName', entityIds: ['id'] },
		];
		expect(document.buildForeignKeyDefinitions()).toEqual(expected);
	});
});

describe('validate', () => {
	test('should return no errors if schema is null', async () => {
		const document = new Document(null, { record: [] });

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
			const document = new Document(schema, { data: { _id: 'id', prop1: 'foo' } });

			const expected = new Map([['_id', 'Document id does not match pattern']]);
			expect(await document.validate()).toEqual(expected);
		});

		test('should not return error if id match is specified and id matches pattern', async () => {
			const document = new Document(schema, { data: { _id: 'foo', prop1: 'foo' } });

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
			const document = new Document(schema, { record: [] });

			const expected = new Map([['prop1', ['Property is required']]]);
			expect(await document.validate()).toEqual(expected);
		});

		test('should not return error at property if schemaType validation is successful', async () => {
			const definition: SchemaDefinition = {
				prop1: { type: 'string', path: '1', required: true },
			};
			const schema = new Schema(definition);
			const document = new Document(schema, { record: ['foo'] });

			const expected = new Map();
			expect(await document.validate()).toEqual(expected);
		});

		test('should return thrown error message if schemaType validation throws an error', async () => {
			// mock StringType.validate to throw
			jest.resetModules();
			const err = new Error('Test error message');
			const castMock = jest.fn().mockImplementation((value) => value);
			const validateMock = jest.fn().mockImplementation(() => {
				throw err;
			});
			jest.doMock('../schemaType/StringType', () =>
				jest.fn(() => ({ cast: castMock, validate: validateMock })),
			);
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const { default: TestSchema } = await import('../Schema');

			const schema = new TestSchema({
				prop1: { type: 'string', path: '1' },
			});
			const document = new Document(schema, { data: { prop1: 'foo' } });

			const expected = new Map([['prop1', 'Test error message']]);
			expect(await document.validate()).toEqual(expected);
		});
	});
});
