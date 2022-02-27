import { TransformDataError } from '#shared/errors';
import type { SchemaTypeDefinitionISOTime } from '../ISOTimeType';
import ISOTimeType from '../ISOTimeType';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(isoTimeType.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not an integer', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformFromDb(1234.5);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError is value is a negative number', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformFromDb(-1);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value is greater than the number of ms in a day and time is in ms', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 'ms',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformFromDb(86400001);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value is greater than the number of seconds in a day and time is in seconds', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformFromDb(86401);
		}).toThrow(TransformDataError);
	});

	test('should return a time when time format is in seconds', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(isoTimeType.transformFromDb(4321)).toBe('01:12:01.000');
	});

	test('should return a time when time format is in milliseconds', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 'ms',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(isoTimeType.transformFromDb(4321)).toBe('00:00:04.321');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(isoTimeType.transformToDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformToDb(1234);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value does not match an ISOTime string', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		expect(() => {
			isoTimeType.transformToDb('12:12:12.');
		}).toThrow(TransformDataError);
	});

	test('should return the number of seconds since midnight when time format is in seconds', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 's',
		};
		const isoTimeType = new ISOTimeType(definition);

		const value = '13:14:15.789'; // milliseconds will be ignored

		expect(isoTimeType.transformToDb(value)).toBe('47655');
	});

	test('should return the number of milliseconds since midnight when time format is in milliseconds', () => {
		const definition: SchemaTypeDefinitionISOTime = {
			type: 'ISOTime',
			path: '1',
			dbFormat: 'ms',
		};
		const isoTimeType = new ISOTimeType(definition);

		const value = '13:14:15.789';

		expect(isoTimeType.transformToDb(value)).toBe('47655789');
	});
});

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
				required: true,
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoTimeType.validate(value, document)).toContain('Property is required');
		});

		test('should not return error message if required is true and value is populated with a time', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
				required: true,
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = '12:00:00.000';
			const document = {};

			expect(await isoTimeType.validate(value, document)).not.toContain('Property is required');
		});

		test('should not return error message if required is false and value is null', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
				required: false,
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoTimeType.validate(value, document)).not.toContain('Property is required');
		});
	});

	describe('type validations', () => {
		test('should not return error message if value is null', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoTimeType.validate(value, document)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is not a string', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = 1234;
			const document = {};

			expect(await isoTimeType.validate(value, document)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is an improperly formatted string', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = 'foo';
			const document = {};

			expect(await isoTimeType.validate(value, document)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should not return error message if value is a properly formatted string', async () => {
			const definition: SchemaTypeDefinitionISOTime = {
				type: 'ISOTime',
				path: '2',
			};
			const isoTimeType = new ISOTimeType(definition);

			const value = '12:01:02.123';
			const document = {};

			expect(await isoTimeType.validate(value, document)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});
	});
});
