import { mock } from 'jest-mock-extended';
import type Document from '../../Document';
import type { SchemaTypeDefinitionBoolean } from '../BooleanType';
import BooleanType from '../BooleanType';

const documentMock = mock<Document>();

describe('transformFromDb', () => {
	const definition: SchemaTypeDefinitionBoolean = {
		type: 'boolean',
		path: '2',
	};

	const booleanType = new BooleanType(definition);

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
	const definition: SchemaTypeDefinitionBoolean = {
		type: 'boolean',
		path: '2',
	};

	const booleanType = new BooleanType(definition);

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
	const definition: SchemaTypeDefinitionBoolean = {
		type: 'boolean',
		path: '2',
	};

	const booleanType = new BooleanType(definition);

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

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', async () => {
			const definition: SchemaTypeDefinitionBoolean = {
				type: 'boolean',
				path: '2',
				required: true,
			};
			const booleanType = new BooleanType(definition);

			const value = null;

			expect(await booleanType.validate(value, documentMock)).toContain('Property is required');
		});

		test('should not return error message if required is true and value is populated with a boolean value', async () => {
			const definition: SchemaTypeDefinitionBoolean = {
				type: 'boolean',
				path: '2',
				required: true,
			};
			const booleanType = new BooleanType(definition);

			const value = true;

			expect(await booleanType.validate(value, documentMock)).not.toContain('Property is required');
		});

		test('should not return error message if required is false and value is null', async () => {
			const definition: SchemaTypeDefinitionBoolean = {
				type: 'boolean',
				path: '2',
				required: false,
			};
			const booleanType = new BooleanType(definition);

			const value = null;

			expect(await booleanType.validate(value, documentMock)).not.toContain('Property is required');
		});
	});
});
