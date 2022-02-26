import { InvalidParameterError, TransformDataError } from '#shared/errors';
import type { SchemaTypeDefinitionNumber } from '../NumberType';
import NumberType from '../NumberType';

describe('constructor', () => {
	test('should throw InvalidParameterError if dbDecimals is not an integer', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 1.1,
		};

		expect(() => {
			new NumberType(definition);
		}).toThrow(InvalidParameterError);
	});
});

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformFromDb(null)).toBeNull();
	});

	test('should return integer if no dbDecimals conversion specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformFromDb(1234)).toBe(1234);
	});

	test('should return decimal if dbDecimals conversion specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformFromDb(1234)).toBe(12.34);
	});

	test('should remove decimals from formatted data by rounding before converting', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformFromDb(1234.5)).toBe(12.35);
	});

	test('should throw TransformDataError if value is not a finite number', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const numberType = new NumberType(definition);

		expect(() => {
			numberType.transformFromDb('foo');
		}).toThrow(TransformDataError);
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformToDb(null)).toBeNull();
	});

	test('should return supplied integer value if no dbDecimals specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformToDb(1234)).toBe('1234');
	});

	test('should round decimals from supplied value if no dbDecimals specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformToDb(1234.5)).toBe('1235');
	});

	test('should return converted internally formatted number when dbDecimals is specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformToDb(1234.5)).toBe('123450');
	});

	test('should round excess decimals and return converted internally formatted number when dbDecimals is specified', () => {
		const definition: SchemaTypeDefinitionNumber = {
			type: 'number',
			path: '2',
			dbDecimals: 2,
		};
		const numberType = new NumberType(definition);

		expect(numberType.transformToDb(1234.567)).toBe('123457');
	});
});

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', async () => {
			const definition: SchemaTypeDefinitionNumber = {
				type: 'number',
				path: '2',
				required: true,
			};
			const numberType = new NumberType(definition);

			const value = null;
			const document = {};

			expect(await numberType.validate(value, document)).toEqual(['Property is required']);
		});

		test('should not return error message if required is true and value is populated with a number', async () => {
			const definition: SchemaTypeDefinitionNumber = {
				type: 'number',
				path: '2',
				required: true,
			};
			const numberType = new NumberType(definition);

			const value = 1234;
			const document = {};

			expect(await numberType.validate(value, document)).toEqual([]);
		});

		test('should not return error message if required is false and value is null', async () => {
			const definition: SchemaTypeDefinitionNumber = {
				type: 'number',
				path: '2',
				required: false,
			};
			const numberType = new NumberType(definition);

			const value = null;
			const document = {};

			expect(await numberType.validate(value, document)).toEqual([]);
		});
	});

	describe('type validations', () => {
		test('should return error message if value is not a number', async () => {
			const definition: SchemaTypeDefinitionNumber = {
				type: 'number',
				path: '2',
				dbDecimals: 2,
			};
			const numberType = new NumberType(definition);

			const value = 'foo';
			const document = {};

			expect(await numberType.validate(value, document)).toEqual([
				'Property cannot be cast into the defined type',
			]);
		});

		test('should not return error message if value is a number', async () => {
			const definition: SchemaTypeDefinitionNumber = {
				type: 'number',
				path: '2',
				dbDecimals: 2,
			};
			const numberType = new NumberType(definition);

			const value = 1234;
			const document = {};

			expect(await numberType.validate(value, document)).toEqual([]);
		});
	});
});
