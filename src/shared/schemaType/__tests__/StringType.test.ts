import type { ForeignKeyDbDefinition } from '#shared/classes/ForeignKeyDbTransformer';
import type { SchemaTypeDefinitionString } from '../StringType';
import StringType from '../StringType';

describe('transformFromDb', () => {
	test('should return null if value is null and no enum is defined', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformFromDb(null)).toBeNull();
	});

	test('should return null if value is null, enum is defined, but empty string is not in enum', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			enum: ['foo', 'bar'],
		};
		const stringType = new StringType(definition);

		expect(stringType.transformFromDb(null)).toBeNull();
	});

	test('should return empty string if value is null, enum is defined, and enum contains empty string', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			enum: ['', 'foo', 'bar'],
		};
		const stringType = new StringType(definition);

		expect(stringType.transformFromDb(null)).toBe('');
	});

	test('should cast non-strings to strings', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformFromDb(1234)).toBe('1234');
	});

	test('should return strings unchanged', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformFromDb('foo')).toBe('foo');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformToDb(null)).toBeNull();
	});

	test('should return value cast to string if non-string', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformToDb(1234)).toBe('1234');
	});

	test('should return strings unchanged', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const stringType = new StringType(definition);

		expect(stringType.transformToDb('foo')).toBe('foo');
	});
});

describe('transformForeignKeyDefinitionsToDb', () => {
	test('should transform value to foreign key definitions', () => {
		const foreignKeyDefinition = { file: 'FILE', entityName: 'FK_ENTITY' };
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			foreignKey: foreignKeyDefinition,
		};
		const stringType = new StringType(definition);

		const value = 'foo';
		const expected: ForeignKeyDbDefinition[] = [
			{ filename: 'FILE', entityId: 'foo', entityName: 'FK_ENTITY' },
		];
		expect(stringType.transformForeignKeyDefinitionsToDb(value)).toEqual(expected);
	});
});

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				required: true,
			};
			const stringType = new StringType(definition);

			const value = null;
			const document = {};

			expect(await stringType.validate(value, document)).toContain('Property is required');
		});

		test('should return error message if required is true and value is empty string', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				required: true,
			};
			const stringType = new StringType(definition);

			const value = '';
			const document = {};

			expect(await stringType.validate(value, document)).toContain('Property is required');
		});

		test('should not return error message if required is true and value is populated with a string', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				required: true,
			};
			const stringType = new StringType(definition);

			const value = 'foo';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain('Property is required');
		});

		test('should not return error message if required is false and value is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				required: false,
			};
			const stringType = new StringType(definition);

			const value = null;
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain('Property is required');
		});

		test('should not return error message if required is false and value is empty string', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				required: false,
			};
			const stringType = new StringType(definition);

			const value = '';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain('Property is required');
		});
	});

	describe('enum validations', () => {
		test('should not return error message if value is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				enum: ['foo', 'bar'],
			};
			const stringType = new StringType(definition);

			const value = null;
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value not present in list of allowed values',
			);
		});

		test('should not return error message if enum is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
			};
			const stringType = new StringType(definition);

			const value = 'foo';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value not present in list of allowed values',
			);
		});

		test('should not return error message if enum is defined and value is in enum', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				enum: ['foo', 'bar'],
			};
			const stringType = new StringType(definition);

			const value = 'foo';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value not present in list of allowed values',
			);
		});

		test('should return error message if enum is defined and value is not in enum', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				enum: ['foo', 'bar'],
			};
			const stringType = new StringType(definition);

			const value = 'baz';
			const document = {};

			expect(await stringType.validate(value, document)).toContain(
				'Value not present in list of allowed values',
			);
		});
	});

	describe('regex validations', () => {
		test('should not return error message if value is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				match: /^foo/,
			};
			const stringType = new StringType(definition);

			const value = null;
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value does not match pattern',
			);
		});

		test('should not return error message if match qualifier is null', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
			};
			const stringType = new StringType(definition);

			const value = 'foo';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value does not match pattern',
			);
		});

		test('should not return error message if value matches match qualifier', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				match: /^foo/,
			};
			const stringType = new StringType(definition);

			const value = 'foo';
			const document = {};

			expect(await stringType.validate(value, document)).not.toContain(
				'Value does not match pattern',
			);
		});

		test('should return error message if match qualifier is defined and value does not match', async () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				match: /^foo/,
			};
			const stringType = new StringType(definition);

			const value = 'bar';
			const document = {};

			expect(await stringType.validate(value, document)).toContain('Value does not match pattern');
		});
	});
});
