import type { ForeignKeyDbDefinition } from 'src/ForeignKeyDbTransformer';
import Document from '../../Document';
import Schema from '../../Schema';
import type { SchemaDefinition } from '../../Schema';
import type { MvRecord } from '../../types';
import EmbeddedType from '../EmbeddedType';

describe('cast', () => {
	const definition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	} satisfies SchemaDefinition;
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should cast null to Document constructed from empty object', () => {
		const value = null;
		const document = embeddedType.cast(value);
		expect(document).toBeInstanceOf(Document);
	});

	test("should cast object to Document with object's properties", () => {
		const value = { prop1: 'foo', prop2: 12.34 };
		const document = embeddedType.cast(value);

		expect(document).toBeInstanceOf(Document);
		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(12.34);
	});

	test('should throw TypeError if value cannot be cast into a plain object', () => {
		const value = [{ prop1: 'foo', prop2: 12.34 }];
		expect(() => {
			embeddedType.cast(value);
		}).toThrow(TypeError);
	});
});

describe('get', () => {
	const definition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	} satisfies SchemaDefinition;
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should return a subdocument constructed from the provided record', () => {
		const record: MvRecord = [null, 'foo', '1234'];
		const document = embeddedType.get(record);

		expect(document).toBeInstanceOf(Document);
		expect(document.prop1).toBe('foo');
		expect(document.prop2).toBe(12.34);
	});
});

describe('set', () => {
	const definition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	} satisfies SchemaDefinition;
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should return a record with the subdocument merged in', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value.prop1 = 'foo';
		value.prop2 = 12.34;

		const expected = ['unrelated', 'foo', '1234'];

		const record = embeddedType.set(originalRecord, value);
		expect(record).toEqual(expected);
	});
});

describe('validate', () => {
	const definition = {
		prop1: { type: 'string', path: '2', required: true },
		prop2: { type: 'number', path: '3', dbDecimals: 2, required: true },
	} satisfies SchemaDefinition;
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should return a map of the errors encountered when validating the subdocument', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);

		const expected = new Map([
			['prop1', ['Property is required']],
			['prop2', ['Property is required']],
		]);

		const validationResults = embeddedType.validate(value);
		expect(validationResults).toEqual(expected);
	});

	test('should return an empty map if no errors are encountered when validating the subdocument', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value.prop1 = 'foo';
		value.prop2 = 12.34;

		const validationResults = embeddedType.validate(value);
		expect(validationResults.size).toBe(0);
	});
});

describe('transformForeignKeyDefinitionsToDb', () => {
	const foreignKeyDefinition = { file: 'FILE', entityName: 'FK_ENTITY' };
	const definition = {
		prop1: { type: 'string', path: '2', foreignKey: foreignKeyDefinition },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	} satisfies SchemaDefinition;
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should return an array of foreign key definitions for the subdocument', () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value.prop1 = 'foo';
		value.prop2 = 1.23;

		const expected: ForeignKeyDbDefinition[] = [
			{ filename: ['FILE'], entityId: 'foo', entityName: 'FK_ENTITY' },
		];
		expect(embeddedType.transformForeignKeyDefinitionsToDb(value)).toEqual(expected);
	});
});
