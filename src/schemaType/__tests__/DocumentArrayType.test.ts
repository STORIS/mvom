import Document from '../../Document';
import type { ForeignKeyDbDefinition } from '../../ForeignKeyDbTransformer';
import type { SchemaDefinition } from '../../Schema';
import Schema from '../../Schema';
import type { MvRecord } from '../../types';
import DocumentArrayType from '../DocumentArrayType';

describe('cast', () => {
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
	const valueSchema = new Schema(definition);
	const documentArrayType = new DocumentArrayType(valueSchema);

	test('should return empty array if value is null', () => {
		expect(documentArrayType.cast(null)).toEqual([]);
	});

	test('should return a new document instance from each object in the array', () => {
		const value = [
			{ prop1: 'foo', prop2: 1.23 },
			{ prop1: 'bar', prop2: 4.56 },
		];
		const documents = documentArrayType.cast(value);
		expect(documents).toHaveLength(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Document);
		});
		const [document1, document2] = documents;
		expect(document1.prop1).toBe('foo');
		expect(document1.prop2).toBe(1.23);
		expect(document2.prop1).toBe('bar');
		expect(document2.prop2).toBe(4.56);
	});

	test('should return a new document instance based on empty object if a subdocument is null', () => {
		const value = [{ prop1: 'foo', prop2: 1.23 }, null];
		const documents = documentArrayType.cast(value);
		expect(documents).toHaveLength(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Document);
		});
		const [document1, document2] = documents;
		expect(document1.prop1).toBe('foo');
		expect(document1.prop2).toBe(1.23);
		expect(document2.prop1).toBeNull();
		expect(document2.prop2).toBeNull();
	});

	test('should throw TypeError if array contents cannot be cast into a plain object', () => {
		const value = [[{ prop1: 'foo', prop2: 12.34 }]];
		expect(() => {
			documentArrayType.cast(value);
		}).toThrow(TypeError);
	});
});

describe('get', () => {
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
	const valueSchema = new Schema(definition);
	const documentArrayType = new DocumentArrayType(valueSchema);

	test('should return an array of subdocuments constructed from the provided record', () => {
		const record: MvRecord = ['unrelated', ['foo', 'bar'], ['123', '456']];
		const documents = documentArrayType.get(record);

		expect(documents).toHaveLength(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Document);
		});
		const [document1, document2] = documents;
		expect(document1.prop1).toBe('foo');
		expect(document1.prop2).toBe(1.23);
		expect(document2.prop1).toBe('bar');
		expect(document2.prop2).toBe(4.56);
	});

	test('should handle construction when mv record consists of unequal length arrays', () => {
		const record: MvRecord = ['unrelated', ['foo', 'bar'], '123'];
		const documents = documentArrayType.get(record);

		expect(documents).toHaveLength(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Document);
		});
		const [document1, document2] = documents;
		expect(document1.prop1).toBe('foo');
		expect(document1.prop2).toBe(1.23);
		expect(document2.prop1).toBe('bar');
		expect(document2.prop2).toBeNull();
	});
});

describe('set', () => {
	test('should return a record with the subdocument array merged in', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '3', dbDecimals: 2 },
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = ['unrelated', ['foo', 'bar'], ['123', '456']];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in and clear existing extra subdocument', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '3', dbDecimals: 2 },
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = [
			'unrelated',
			['cleared', 'cleared', 'cleared'],
			['cleared', 'cleared', 'cleared'],
		];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = ['unrelated', ['foo', 'bar'], ['123', '456']];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in when the document has missing schema properties', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '3', dbDecimals: 2 },
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = ['unrelated', [null, 'bar'], ['123', null]];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in when the schema definition is using multi-part paths', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2.1' },
			prop2: { type: 'number', path: '2.2', dbDecimals: 2 },
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = [
			'unrelated',
			[
				['foo', 'bar'],
				['123', '456'],
			],
		];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in when the schema definition is using multi-part paths and clear existing extra subdocument', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2.1' },
			prop2: { type: 'number', path: '2.2', dbDecimals: 2 },
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = [
			'unrelated',
			[
				['cleared', 'cleared', 'cleared'],
				['cleared', 'cleared', 'cleared'],
			],
		];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = [
			'unrelated',
			[
				['foo', 'bar'],
				['123', '456'],
			],
		];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in when subdocuments include arrays', () => {
		const definition: SchemaDefinition = {
			prop1: { type: 'string', path: '2' },
			prop2: { type: 'number', path: '3', dbDecimals: 2 },
			prop3: [{ type: 'string', path: '4' }],
		};
		const valueSchema = new Schema(definition);
		const documentArrayType = new DocumentArrayType(valueSchema);

		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value1.prop3 = ['value1-pos0', 'value1-pos1'];
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;
		value2.prop3 = ['value2-pos0', 'value2-pos1'];

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = [
			'unrelated',
			['foo', 'bar'],
			['123', '456'],
			[
				['value1-pos0', 'value1-pos1'],
				['value2-pos0', 'value2-pos1'],
			],
		];
		expect(record).toEqual(expected);
	});
});

describe('validate', () => {
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2', required: true },
		prop2: { type: 'number', path: '3', dbDecimals: 2, required: true },
	};
	const valueSchema = new Schema(definition);
	const documentArrayType = new DocumentArrayType(valueSchema);

	test('should return a single Map for the errors encountered when validating each subdocument. prepending the index to the nested document key', async () => {
		const originalRecord: MvRecord = ['unrelated'];

		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);

		const validationResults = await documentArrayType.validate([value1, value2]);

		const expected = new Map([
			['0.prop1', ['Property is required']],
			['0.prop2', ['Property is required']],
			['1.prop1', ['Property is required']],
			['1.prop2', ['Property is required']],
		]);

		expect(validationResults).toEqual(expected);
	});

	test('should return an empty map with no errors when no errors reported', async () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const validationResults = await documentArrayType.validate([value1, value2]);
		expect(validationResults).toEqual(new Map());
	});
});

describe('transformForeignKeyDefinitionsToDb', () => {
	const foreignKeyDefinition = { file: 'FILE', entityName: 'FK_ENTITY' };
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2', foreignKey: foreignKeyDefinition },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
	const valueSchema = new Schema(definition);
	const documentArrayType = new DocumentArrayType(valueSchema);

	test('should transform document array values to foreign key definitions', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value1 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		const value2 = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const expected: ForeignKeyDbDefinition[] = [
			{ filename: ['FILE'], entityId: 'foo', entityName: 'FK_ENTITY' },
			{ filename: ['FILE'], entityId: 'bar', entityName: 'FK_ENTITY' },
		];
		expect(documentArrayType.transformForeignKeyDefinitionsToDb([value1, value2])).toEqual(
			expected,
		);
	});
});
