import { TransformDataError } from '../../errors';
import type { SchemaTypeDefinitionISOCalendarDate } from '../ISOCalendarDateType';
import ISOCalendarDateType from '../ISOCalendarDateType';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		expect(isoCalendarDateType.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not an integer', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		expect(() => {
			isoCalendarDateType.transformFromDb(1234.5);
		}).toThrow(TransformDataError);
	});

	test('should return a date', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		const value = 19782; // 2022-02-27
		expect(isoCalendarDateType.transformFromDb(value)).toBe('2022-02-27');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		expect(isoCalendarDateType.transformToDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		expect(() => {
			isoCalendarDateType.transformToDb(1234);
		}).toThrow(TransformDataError);
	});

	test('should return the number of days since the multivalue epoch', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '1',
		};
		const isoCalendarDateType = new ISOCalendarDateType(definition);

		const value = '2022-02-27';
		expect(isoCalendarDateType.transformToDb(value)).toBe('19782');
	});
});

describe('validations', () => {
	describe('required validations', () => {
		test('should return error message if required is true and value is null', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
				required: true,
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = null;

			expect(isoCalendarDateType.validate(value)).toContain('Property is required');
		});

		test('should not return error message if required is true and value is populated with a date', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
				required: true,
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = '2022-02-27';

			expect(isoCalendarDateType.validate(value)).not.toContain('Property is required');
		});

		test('should not return error message if required is false and value is null', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
				required: false,
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = null;

			expect(isoCalendarDateType.validate(value)).not.toContain('Property is required');
		});
	});

	describe('type validations', () => {
		test('should not return error message if value is null', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = null;

			expect(isoCalendarDateType.validate(value)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is not a string', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = 1234;

			expect(isoCalendarDateType.validate(value)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is an improperly formatted string', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = 'foo';

			expect(isoCalendarDateType.validate(value)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should return error message if value is an invalid date', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = '2022-02-31'; // only 28 days in month

			expect(isoCalendarDateType.validate(value)).toContain(
				'Property cannot be cast into the defined type',
			);
		});

		test('should not return error message if value is a properly formatted string', () => {
			const definition: SchemaTypeDefinitionISOCalendarDate = {
				type: 'ISOCalendarDate',
				path: '2',
			};
			const isoCalendarDateType = new ISOCalendarDateType(definition);

			const value = '2022-02-27';

			expect(isoCalendarDateType.validate(value)).not.toContain(
				'Property cannot be cast into the defined type',
			);
		});
	});
});
