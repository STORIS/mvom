import type { SchemaTypeDefinitionBoolean } from '../BooleanType';
import BooleanType from '../BooleanType';

const definition: SchemaTypeDefinitionBoolean = {
	type: 'boolean',
	path: '2',
};

const booleanType = new BooleanType(definition);

describe('transformFromDb', () => {
	test('should transform null to false', () => {
		expect(booleanType.transformFromDb(null)).toBe(false);
	});

	test('should transform string 0 to false', () => {
		expect(booleanType.transformFromDb('0')).toBe(false);
	});

	test('should transform 0 to false', () => {
		expect(booleanType.transformFromDb(0)).toBe(false);
	});

	test('should transform 1 to true', () => {
		expect(booleanType.transformFromDb(1)).toBe(true);
	});

	test('should transform truthy value to true', () => {
		expect(booleanType.transformFromDb('foo')).toBe(true);
	});
});

describe('transformToDb', () => {
	test('should transform boolean true to 1', () => {
		expect(booleanType.transformToDb(true)).toBe('1');
	});

	test('should transform boolean false to 0', () => {
		expect(booleanType.transformToDb(false)).toBe('0');
	});

	test('should transform truthy value to 1', () => {
		expect(booleanType.transformToDb('truthy')).toBe('1');
	});

	test('should transform falsy value to 0', () => {
		expect(booleanType.transformToDb('')).toBe('0');
	});
});

describe('transformToQuery', () => {
	test('should transform boolean true to 1', () => {
		expect(booleanType.transformToQuery(true)).toBe('1');
	});

	test('should transform string true to 1', () => {
		expect(booleanType.transformToQuery('true')).toBe('1');
	});

	test('should transform string TRUE to 1', () => {
		expect(booleanType.transformToQuery('TRUE')).toBe('1');
	});

	test('should transform boolean false to 0', () => {
		expect(booleanType.transformToQuery(false)).toBe('0');
	});

	test('should transform string false to 0', () => {
		expect(booleanType.transformToQuery('false')).toBe('0');
	});

	test('should transform string FALSE to 0', () => {
		expect(booleanType.transformToQuery('FALSE')).toBe('0');
	});

	test('should not transform other values', () => {
		expect(booleanType.transformToQuery('foo')).toBe('foo');
	});
});
