import { TransformDataError } from '#shared/errors';
import type { SchemaTypeDefinitionISOCalendarDateTime } from '../ISOCalendarDateTimeType';
import ISOCalendarDateTimeType from '../ISOCalendarDateTimeType';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		expect(isoCalendarDateTimeType.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if date part is invalid', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = 'foo.01234';
		expect(() => {
			isoCalendarDateTimeType.transformFromDb(value);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if time part is invalid', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = '19782.foo';
		expect(() => {
			isoCalendarDateTimeType.transformFromDb(value);
		}).toThrow(TransformDataError);
	});

	test('should return a date-time string if time is in seconds', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
			dbFormat: 's',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = '19782.04321';
		expect(isoCalendarDateTimeType.transformFromDb(value)).toBe('2022-02-27T01:12:01.000');
	});

	test('should return a date-time string if time is in milliseconds', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
			dbFormat: 'ms',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = '19782.00004321';
		expect(isoCalendarDateTimeType.transformFromDb(value)).toBe('2022-02-27T00:00:04.321');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		expect(isoCalendarDateTimeType.transformToDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		expect(() => {
			isoCalendarDateTimeType.transformToDb(1234);
		}).toThrow(TransformDataError);
	});

	test('should return a multivalue date-time string when the format is in seconds', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
			dbFormat: 's',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = '2022-02-27T01:12:01.000';
		expect(isoCalendarDateTimeType.transformToDb(value)).toBe('19782.04321');
	});

	test('should return a multivalue date-time string when the format is in milliseconds', () => {
		const definition: SchemaTypeDefinitionISOCalendarDateTime = {
			type: 'ISOCalendarDateTime',
			path: '1',
			dbFormat: 'ms',
		};
		const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

		const value = '2022-02-27T00:00:04.321';
		expect(isoCalendarDateTimeType.transformToDb(value)).toBe('19782.00004321');
	});
});

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
				required: true,
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).toContain(
				'Property is required',
			);
		});

		test('should not return error message if required is true and value is populated with a date-time', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
				required: true,
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = '2022-02-27T12:12:12.000';
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).not.toContain(
				'Property is required',
			);
		});

		test('should not return error message if required is false and value is null', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
				required: false,
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).not.toContain(
				'Property is required',
			);
		});
	});

	describe('type validations', () => {
		test('should not return error message if value is null', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = null;
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is not a string', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = 1234;
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if date value is improperly formatted', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = 'fooT12:12:12.123';
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if time value is improperly formatted', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = '2022-02-27Tfoo';
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should not return error message if value is a properly formatted string', async () => {
			const definition: SchemaTypeDefinitionISOCalendarDateTime = {
				type: 'ISOCalendarDateTime',
				path: '2',
			};
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType(definition);

			const value = '2022-02-27T12:12:12.123';
			const document = {};

			expect(await isoCalendarDateTimeType.validate(value, document)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});
	});
});
