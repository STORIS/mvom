import { NumberType, StringType } from '..';
import type { ForeignKeyDbDefinition } from '../../shared/classes/ForeignKeyDbTransformer';
import type { MvRecord } from '../../shared/types';
import NestedArrayType from '../NestedArrayType';
import type { SchemaTypeDefinitionNumber } from '../NumberType';
import type { SchemaTypeDefinitionString } from '../StringType';

describe('get', () => {
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
				[123, 456],
				[789, 1234],
			],
		];

		const expected = [
			[1.23, 4.56],
			[7.89, 12.34],
		];
		expect(nestedArrayType.get(record)).toEqual(expected);
	});

	test('should get from specified path and transform based on value schema when content is non-array', () => {
		const record: MvRecord = [null, [123, 456]];

		const expected = [[1.23], [4.56]];
		expect(nestedArrayType.get(record)).toEqual(expected);
	});
});

describe('set', () => {
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
		const document = {};

		const validationResult = await nestedArrayType.validate(value, document);
		expect(validationResult).toContain('Property is required');
		expect(validationResult).toHaveLength(2);
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
		const document = {};

		const validationResult = await nestedArrayType.validate(value, document);
		expect(validationResult).toContain('Property is required');
		expect(validationResult).toHaveLength(4);
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
		const document = {};

		const validationResult = await nestedArrayType.validate(value, document);
		expect(validationResult).toHaveLength(0);
	});
});
