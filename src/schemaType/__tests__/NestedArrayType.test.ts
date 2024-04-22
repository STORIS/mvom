import { mock } from 'jest-mock-extended';
import { NumberType, StringType } from '..';
import type Document from '../../Document';
import type { ForeignKeyDbDefinition } from '../../ForeignKeyDbTransformer';
import type { MvRecord } from '../../types';
import NestedArrayType from '../NestedArrayType';
import type { SchemaTypeDefinitionNumber } from '../NumberType';
import type { SchemaTypeDefinitionString } from '../StringType';

const documentMock = mock<Document>();

describe('get', () => {
	describe('no encryption', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const nestedArrayType = new NestedArrayType(valueSchemaType);

		test('should get from specified path and transform based on value schema when content is array', () => {
			const record: MvRecord = [
				null,
				[
					['123', '456'],
					['789', '1234'],
				],
			];

			const expected = [
				[1.23, 4.56],
				[7.89, 12.34],
			];
			expect(nestedArrayType.get(record)).toEqual(expected);
		});

		test('should get from specified path and transform based on value schema when content is non-array', () => {
			const record: MvRecord = [null, ['123', '456']];

			const expected = [[1.23], [4.56]];
			expect(nestedArrayType.get(record)).toEqual(expected);
		});
	});

	describe('decryption', () => {
		test('should get from specified path and return decrypted value', () => {
			const encrypt = jest.fn().mockReturnValue('encrypted');
			const decrypt = jest.fn().mockReturnValue('decrypted');

			const valueSchemaDefinition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				encrypted: true,
			};
			const valueSchemaType = new StringType(valueSchemaDefinition, { encrypt, decrypt });
			const arrayType = new NestedArrayType(valueSchemaType);

			const record: MvRecord = [null, [['encrypted'], [null, 'encrypted']]];

			const expected = [['decrypted'], [null, 'decrypted']];
			expect(arrayType.get(record)).toEqual(expected);
		});
	});
});

describe('set', () => {
	describe('no encryption', () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const nestedArrayType = new NestedArrayType(valueSchemaType);

		test('should transform based on value schema and set into array when value is an array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = [
				[1.23, 4.56],
				[7.89, 12.34],
			];

			const expected: MvRecord = [
				null,
				[
					['123', '456'],
					['789', '1234'],
				],
			];
			expect(nestedArrayType.set(originalRecord, value)).toEqual(expected);
		});

		test('should transform based on value schema and set into array when value is a non-array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = 1.23;

			const expected: MvRecord = [null, [['123']]];
			expect(nestedArrayType.set(originalRecord, value)).toEqual(expected);
		});

		test('should transform based on value schema and set into array when value is an un-nested array', () => {
			const originalRecord: MvRecord = [null, null];
			const value = [1.23];

			const expected: MvRecord = [null, [['123']]];
			expect(nestedArrayType.set(originalRecord, value)).toEqual(expected);
		});
	});

	describe('encryption', () => {
		test('should set into encrypted path when value is an array', () => {
			const encrypt = jest.fn().mockReturnValue('encrypted');
			const decrypt = jest.fn().mockReturnValue('decrypted');

			const valueSchemaDefinition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				encrypted: true,
			};
			const valueSchemaType = new StringType(valueSchemaDefinition, { encrypt, decrypt });
			const arrayType = new NestedArrayType(valueSchemaType);

			const originalRecord: MvRecord = [null, [[null], [null]]];
			const value = [['foo'], [null, 'bar']];

			const expected: MvRecord = [null, [['encrypted'], [null, 'encrypted']]];
			expect(arrayType.set(originalRecord, value)).toEqual(expected);
		});

		test('should set into encrypted path when value is noy an array', () => {
			const encrypt = jest.fn().mockReturnValue('encrypted');
			const decrypt = jest.fn().mockReturnValue('decrypted');

			const valueSchemaDefinition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				encrypted: true,
			};
			const valueSchemaType = new StringType(valueSchemaDefinition, { encrypt, decrypt });
			const arrayType = new NestedArrayType(valueSchemaType);

			const originalRecord: MvRecord = [null, null];
			const value = 'foo';

			const expected: MvRecord = [null, [['encrypted']]];
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
		const nestedArrayType = new NestedArrayType(stringType);

		const value = [
			['foo', 'bar'],
			['baz', 'qux'],
		];
		const expected: ForeignKeyDbDefinition[] = [
			{ filename: 'FILE', entityId: 'foo', entityName: 'FK_ENTITY' },
			{ filename: 'FILE', entityId: 'bar', entityName: 'FK_ENTITY' },
			{ filename: 'FILE', entityId: 'baz', entityName: 'FK_ENTITY' },
			{ filename: 'FILE', entityId: 'qux', entityName: 'FK_ENTITY' },
		];
		expect(nestedArrayType.transformForeignKeyDefinitionsToDb(value)).toEqual(expected);
	});
});

describe('validate', () => {
	test('should return errors defined by value schema validators when data is an un-nested array', async () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
			required: true,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const nestedArrayType = new NestedArrayType(valueSchemaType);

		const value = [null, null, 1.23];

		const expected = new Map([
			['0.0', ['Property is required']],
			['1.0', ['Property is required']],
		]);

		const validationResult = await nestedArrayType.validate(value, documentMock);
		expect(validationResult).toEqual(expected);
		expect(validationResult.size).toBe(2);
	});

	test('should return errors defined by value schema validators when data is a nested array', async () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
			required: true,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const nestedArrayType = new NestedArrayType(valueSchemaType);

		const value = [
			[null, null],
			[null, null],
			[1.23, 4.56],
		];

		const expected = new Map([
			['0.0', ['Property is required']],
			['0.1', ['Property is required']],
			['1.0', ['Property is required']],
			['1.1', ['Property is required']],
		]);
		const validationResult = await nestedArrayType.validate(value, documentMock);
		expect(validationResult).toEqual(expected);
		expect(validationResult.size).toBe(4);
	});

	test('should have no errors if value schema validators pass', async () => {
		const valueSchemaDefinition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2.2',
			dbDecimals: 2,
			required: true,
		};
		const valueSchemaType = new NumberType(valueSchemaDefinition);
		const nestedArrayType = new NestedArrayType(valueSchemaType);

		const value = [
			[1.23, 4.56],
			[7.89, 12.34],
		];

		const validationResult = await nestedArrayType.validate(value, documentMock);
		expect(validationResult.size).toBe(0);
	});
});
