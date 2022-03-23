import { TransformDataError } from '../../errors';
import ISOTimeDataTransformer from '../ISOTimeDataTransformer';

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		expect(isoTimeDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should throw TransformDataError if value is not an integer', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		expect(() => {
			isoTimeDataTransformer.transformFromDb(1234.5);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError is value is a negative number', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		expect(() => {
			isoTimeDataTransformer.transformFromDb(-1);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value is greater than the number of ms in a day and time is in ms', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		expect(() => {
			isoTimeDataTransformer.transformFromDb(86400001);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value is greater than the number of seconds in a day and time is in seconds', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		expect(() => {
			isoTimeDataTransformer.transformFromDb(86401);
		}).toThrow(TransformDataError);
	});

	test('should return a time when time format is in seconds', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		expect(isoTimeDataTransformer.transformFromDb(47655)).toBe('13:14:15.000');
	});

	test('should return a time when time format is in milliseconds', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('ms');

		expect(isoTimeDataTransformer.transformFromDb(47655789)).toBe('13:14:15.789');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		const value = null;

		expect(isoTimeDataTransformer.transformToDb(value)).toBeNull();
	});

	test('should throw TransformDataError if value is not a string', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		const value = 1234;

		expect(() => {
			isoTimeDataTransformer.transformToDb(value);
		}).toThrow(TransformDataError);
	});

	test('should throw TransformDataError if value is an improperly formatted string', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		const value = '13:14:15'; // missing milliseconds

		expect(() => {
			isoTimeDataTransformer.transformToDb(value);
		}).toThrow(TransformDataError);
	});

	test('should return the number of seconds since midnight when time format is in seconds', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('s');

		const value = '13:14:15.789'; // milliseconds will be ignored

		expect(isoTimeDataTransformer.transformToDb(value)).toBe('47655');
	});

	test('should return the number of milliseconds since midnight when time format is in milliseconds', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer('ms');

		const value = '13:14:15.789';

		expect(isoTimeDataTransformer.transformToDb(value)).toBe('47655789');
	});
});

describe('transformToQuery', () => {
	test('should return empty string if value is empty string', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		const value = '';
		expect(isoTimeDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return empty string if value is null', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		const value = null;
		expect(isoTimeDataTransformer.transformToQuery(value)).toBe('');
	});

	test('should return the number of seconds since midnight', () => {
		const isoTimeDataTransformer = new ISOTimeDataTransformer();

		const value = '13:14:15.789';
		expect(isoTimeDataTransformer.transformToQuery(value)).toBe('47655');
	});
});
