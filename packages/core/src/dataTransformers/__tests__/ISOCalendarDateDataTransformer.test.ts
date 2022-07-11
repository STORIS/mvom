import { TransformDataError } from '../../errors';
import ISOCalendarDateDataTransformer from '../ISOCalendarDateDataTransformer';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		expect(isoCalendarDateDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not an integer', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		expect(() => {
			isoCalendarDateDataTransformer.transformFromDb(1234.5);
		}).toThrow(TransformDataError);
	});

	test('should return a date', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		const value = 19782; // 2022-02-27
		expect(isoCalendarDateDataTransformer.transformFromDb(value)).toBe('2022-02-27');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		expect(isoCalendarDateDataTransformer.transformToDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		expect(() => {
			isoCalendarDateDataTransformer.transformToDb(1234);
		}).toThrow(TransformDataError);
	});

	test('should return the number of days since the multivalue epoch', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		const value = '2022-02-27';
		expect(isoCalendarDateDataTransformer.transformToDb(value)).toBe('19782');
	});
});

describe('transformToQuery', () => {
	test('should return empty string if value is empty string', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		const value = '';
		expect(isoCalendarDateDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return empty string if value is null', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		const value = null;
		expect(isoCalendarDateDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return the number of days since the multivalue epoch', () => {
		const isoCalendarDateDataTransformer = new ISOCalendarDateDataTransformer();

		const value = '2022-02-27';
		expect(isoCalendarDateDataTransformer.transformToQuery(value)).toBe('19782');
	});
});
