import Document from '../../Document';
import Schema from '../../Schema';
import type { SchemaDefinition } from '../../Schema';
import type { MvRecord } from '../../types';
import EmbeddedType from '../EmbeddedType';

describe('cast', () => {
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
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
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
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
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2' },
		prop2: { type: 'number', path: '3', dbDecimals: 2 },
	};
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
	const definition: SchemaDefinition = {
		prop1: { type: 'string', path: '2', required: true },
		prop2: { type: 'number', path: '3', dbDecimals: 2, required: true },
	};
	const valueSchema = new Schema(definition);
	const embeddedType = new EmbeddedType(valueSchema);

	test('should return a map of the errors encountered when validating the subdocument', async () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);

		const expected = new Map([
			['prop1', ['Property is required']],
			['prop2', ['Property is required']],
		]);

		const validationResults = await embeddedType.validate(value);
		expect(validationResults).toEqual(expected);
	});

	test('should return an empty map if no errors are encountered when validating the subdocument', async () => {
		const originalRecord: MvRecord = ['unrelated'];
		const value = Document.createSubdocumentFromRecord(valueSchema, originalRecord);
		value.prop1 = 'foo';
		value.prop2 = 12.34;

		const validationResults = await embeddedType.validate(value);
		expect(validationResults.size).toBe(0);
	});
});
