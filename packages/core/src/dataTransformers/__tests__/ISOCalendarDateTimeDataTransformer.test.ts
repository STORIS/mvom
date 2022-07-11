import { TransformDataError } from '../../errors';
import ISOCalendarDateTimeDataTransformer from '../ISOCalendarDateTimeDataTransformer';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		expect(isoCalendarDateTimeDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if date part is invalid', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = 'foo.01234';
		expect(() => {
			isoCalendarDateTimeDataTransformer.transformFromDb(value);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if time part is invalid', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = '19782.foo';
		expect(() => {
			isoCalendarDateTimeDataTransformer.transformFromDb(value);
		}).toThrow(TransformDataError);
	});

	test('should return a date-time string if time is in seconds', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer('s');

		const value = '19782.47655';
		expect(isoCalendarDateTimeDataTransformer.transformFromDb(value)).toBe(
			'2022-02-27T13:14:15.000',
		);
	});

	test('should return a date-time string if time is in milliseconds', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer('ms');

		const value = '19782.47655789';
		expect(isoCalendarDateTimeDataTransformer.transformFromDb(value)).toBe(
			'2022-02-27T13:14:15.789',
		);
	});

	test('should return a date-time string if time is in milliseconds because dbFormat is not specified', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = '19782.47655789';
		expect(isoCalendarDateTimeDataTransformer.transformFromDb(value)).toBe(
			'2022-02-27T13:14:15.789',
		);
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		expect(isoCalendarDateTimeDataTransformer.transformToDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		expect(() => {
			isoCalendarDateTimeDataTransformer.transformToDb(1234);
		}).toThrow(TransformDataError);
	});

	test('should return a multivalue date-time string when the format is in seconds', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer('s');

		const value = '2022-02-27T13:14:15.789';
		expect(isoCalendarDateTimeDataTransformer.transformToDb(value)).toBe('19782.47655');
	});

	test('should return a multivalue date-time string when the format is in milliseconds', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer('ms');

		const value = '2022-02-27T13:14:15.789';
		expect(isoCalendarDateTimeDataTransformer.transformToDb(value)).toBe('19782.47655789');
	});

	test('should return a multivalue date-time string when the format is in milliseconds because dbFormat is not specified', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = '2022-02-27T13:14:15.789';
		expect(isoCalendarDateTimeDataTransformer.transformToDb(value)).toBe('19782.47655789');
	});
});

describe('transformToQuery', () => {
	test('should return empty string if value is empty string', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = '';
		expect(isoCalendarDateTimeDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return empty string if value is null', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = null;
		expect(isoCalendarDateTimeDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return a multivalue date-time string when the format is in milliseconds because dbFormat is not specified', () => {
		const isoCalendarDateTimeDataTransformer = new ISOCalendarDateTimeDataTransformer();

		const value = '2022-02-27T13:14:15.789';
		expect(isoCalendarDateTimeDataTransformer.transformToQuery(value)).toBe('19782.47655789');
	});
});
