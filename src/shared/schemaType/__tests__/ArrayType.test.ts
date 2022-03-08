import { NumberType, StringType } from '..';
import type { ForeignKeyDbDefinition } from '../../classes/ForeignKeyDbTransformer';
import type { MvRecord } from '../../types';
import ArrayType from '../ArrayType';
import type { SchemaTypeDefinitionNumber } from '../NumberType';
import type { SchemaTypeDefinitionString } from '../StringType';

describe('get', () => {
	describe('attribute based path', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		test('should get from specified path and transform based on value schema when content is array', () => {
			const record: MvRecord = [null, [123, 456, 789]];

			const expected = [1.23, 4.56, 7.89];
			expect(arrayType.get(record)).toEqual(expected);
		});

		test('should get from specified path and transform based on value schema when content is non-array', () => {
			const record: MvRecord = [null, 123];

			const expected = [1.23];
			expect(arrayType.get(record)).toEqual(expected);
		});
	});

	describe('value based path', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		test('should get from specified path and transform based on value schema when content is array', () => {
			const record: MvRecord = [null, [null, [123, 456, 789]]];

			const expected = [1.23, 4.56, 7.89];
			expect(arrayType.get(record)).toEqual(expected);
		});

		test('should get from specified path and transform based on value schema when content is non-array', () => {
			const record: MvRecord = [null, [null, 123]];

			const expected = [1.23];
			expect(arrayType.get(record)).toEqual(expected);
		});
	});
});

describe('set', () => {
	describe('attribute based path', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		test('should transform based on value schema and set into array when value is an array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = [1.23, 4.56, 7.89];

			const expected: MvRecord = [null, ['123', '456', '789']];
			expect(arrayType.set(originalRecord, value)).toEqual(expected);
		});

		test('should transform based on value schema and set into array when value is a non-array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = 1.23;

			const expected: MvRecord = [null, ['123']];
			expect(arrayType.set(originalRecord, value)).toEqual(expected);
		});
	});

	describe('value based path', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		test('should transform based on value schema and set into array when value is an array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = [1.23, 4.56, 7.89];

			const expected: MvRecord = [null, [undefined, ['123', '456', '789']]];
			expect(arrayType.set(originalRecord, value)).toEqual(expected);
		});

		test('should transform based on value schema and set into array when value is a non-array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = 1.23;

			const expected: MvRecord = [null, [undefined, ['123']]];
			expect(arrayType.set(originalRecord, value)).toEqual(expected);
		});
	});
});

describe('transformForeignKeyDefinitionsToDb', () => {
	test('should transform array value to foreign key definitions', () => {
		const foreignKeyDefinition = { file: 'FILE', entityName: 'FK_ENTITY' };
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			foreignKey: foreignKeyDefinition,
		};
		const stringType = new StringType(definition);
		const arrayType = new ArrayType(stringType);

		const value = ['foo', 'bar'];
		const expected: ForeignKeyDbDefinition[] = [
			{ filename: 'FILE', entityId: 'foo', entityName: 'FK_ENTITY' },
			{ filename: 'FILE', entityId: 'bar', entityName: 'FK_ENTITY' },
		];
		expect(arrayType.transformForeignKeyDefinitionsToDb(value)).toEqual(expected);
	});
});

describe('validate', () => {
	test('should return errors defined by value schema validators', async () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
			required: true,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		const value = [null, null, 1.23];
		const document = {};

		const validationResult = await arrayType.validate(value, document);
		expect(validationResult).toContain('Property is required');
		expect(validationResult).toHaveLength(2);
	});

	test('should have no errors if value schema validators pass', async () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
			required: true,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const arrayType = new ArrayType(valueSchemaType);

		const value = [1.23, 4.56, 7.89];
		const document = {};

		const validationResult = await arrayType.validate(value, document);
		expect(validationResult).toHaveLength(0);
	});
});
