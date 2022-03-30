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
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
	const valueSchema = new Schema(definition);
	const documentArrayType = new DocumentArrayType(valueSchema);

	test('should return a record with the subdocument array merged in', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value1 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		const value2 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = ['unrelated', ['foo', 'bar'], ['123', '456']];
		expect(record).toEqual(expected);
	});

	test('should return a record with the subdocument array merged in when the document has missing schema properties', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value1 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		const value2 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';

		const record = documentArrayType.set(originalRecord, [value1, value2]);
		const expected: MvRecord = ['unrelated', [null, 'bar'], ['123', null]];
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

	test('should return an array of the errors encountered when validating the subdocuments', async () => {
		const originalRecord: MvRecord = ['unrelated'];

		const value1 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		const value2 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });

		const validationResults = await documentArrayType.validate([value1, value2]);
		expect(validationResults).toHaveLength(4);
		validationResults.forEach((result) => {
			expect(result).toBe('Property is required');
		});
	});

	test('should return an empty array if no errors are encountered when validating the subdocument', async () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value1 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		const value2 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const validationResults = await documentArrayType.validate([value1, value2]);
		expect(validationResults).toEqual([]);
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
		const value1 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		const value2 = new Document(valueSchema, { record: originalRecord, isSubdocument: true });
		value1.prop1 = 'foo';
		value1.prop2 = 1.23;
		value2.prop1 = 'bar';
		value2.prop2 = 4.56;

		const expected: ForeignKeyDbDefinition[] = [
			{ filename: 'FILE', entityId: 'foo', entityName: 'FK_ENTITY' },
			{ filename: 'FILE', entityId: 'bar', entityName: 'FK_ENTITY' },
		];
		expect(documentArrayType.transformForeignKeyDefinitionsToDb([value1, value2])).toEqual(
			expected,
		);
	});
});
