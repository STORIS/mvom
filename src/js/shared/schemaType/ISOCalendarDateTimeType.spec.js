import ISOCalendarDateTimeType from './ISOCalendarDateTimeType';
import ISOCalendarDateType from './ISOCalendarDateType';
import ISOTimeType from './ISOTimeType';

jest.mock('./ISOCalendarDateType');
jest.mock('./ISOTimeType');

describe('ISOCalendarDateTimeType', () => {
	describe('constructor', () => {
		test('should throw if a path is not provided in the definition', () => {
			expect(() => new ISOCalendarDateTimeType({})).toThrow();
		});

		test('should not throw if a path is provided in the definition', () => {
			expect(() => new ISOCalendarDateTimeType({ path: '1' })).not.toThrow();
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
			beforeEach(() => {
				ISOCalendarDateType.prototype.transformFromDb.mockReturnValue('2021-06-23');
				ISOTimeType.prototype.transformFromDb.mockReturnValue('12:00:00.000');
			});

			test('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformFromDb('19534.43200000');
				expect(ISOCalendarDateType.prototype.transformFromDb).toHaveBeenCalledWith(19534);
				expect(ISOTimeType.prototype.transformFromDb).toHaveBeenCalledWith(43200000);
			});

			test("should return null if the input value isn't provided", () => {
				expect(isoCalendarDateTimeType.transformFromDb()).toBeNull();
			});

			test('should return a interpolated string of the results from the Date and Time classes', () => {
				expect(isoCalendarDateTimeType.transformFromDb('19534.43200000')).toBe(
					'2021-06-23T12:00:00.000',
				);
			});
		});

		describe('transformToDb', () => {
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
			beforeEach(() => {
				ISOCalendarDateType.prototype.transformToDb.mockReturnValue('19533');
				ISOTimeType.prototype.transformToDb.mockReturnValue('43200000');
			});

			test('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformToDb('2021-06-23T12:00:00.000');
				expect(ISOCalendarDateType.prototype.transformToDb).toHaveBeenCalledWith('2021-06-23');
				expect(ISOTimeType.prototype.transformToDb).toHaveBeenCalledWith('12:00:00.000');
			});

			test('should return null if parameter is null', () => {
				expect(isoCalendarDateTimeType.transformToDb(null)).toBeNull();
			});

			test('should return an interpolated string of the results from the Date and Time classes', () => {
				expect(isoCalendarDateTimeType.transformToDb('2021-06-23T12:00:00.000')).toBe(
					'19533.43200000',
				);
			});

			describe('time formatting', () => {
				beforeEach(() => {
					ISOTimeType.prototype.transformToDb.mockReturnValue('60');
				});
				test('should pad the time component up to 8 digits if necessary when formatting for milliseconds', () => {
					expect(isoCalendarDateTimeType.transformToDb('2021-06-23T12:00:00.000')).toBe(
						'19533.00000060',
					);
				});

				test('should pad the time component up to 5 digits if necessary when formatting for seconds', () => {
					const isoCalendarDateTimeType2 = new ISOCalendarDateTimeType({
						path: '1',
						dbFormat: 's',
					});
					expect(isoCalendarDateTimeType2.transformToDb('2021-06-23T12:00:00.000')).toBe(
						'19533.00060',
					);
				});
			});
		});

		describe('_validateType', () => {
			const isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });

			test('should resolve as true if value is undefined', async () => {
				expect(await isoCalendarDateTimeType._validateType()).toBe(true);
			});

			test('should resolve as true if value is null', async () => {
				expect(await isoCalendarDateTimeType._validateType(null)).toBe(true);
			});

			test('should resolve as false if value is not a string', async () => {
				expect(await isoCalendarDateTimeType._validateType(1337)).toBe(false);
			});

			test('should resolve as false if datePart is empty string', async () => {
				expect(await isoCalendarDateTimeType._validateType('Tfoo')).toBe(false);
			});

			test('should resolve as false if timePart is empty string', async () => {
				expect(await isoCalendarDateTimeType._validateType('fooT')).toBe(false);
			});

			test('should resolve as false if timePart is undefined', async () => {
				expect(await isoCalendarDateTimeType._validateType('foo')).toBe(false);
			});

			describe('date parts', () => {
				beforeAll(() => {
					jest.clearAllMocks();
				});
				test('should resolve as false if datePart is not valid', async () => {
					ISOCalendarDateType.prototype.validate.mockResolvedValue(false);
					ISOTimeType.prototype.validate.mockResolvedValue(true);
					expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(false);
				});

				test('should resolve as false if timePart is not valid', async () => {
					ISOCalendarDateType.prototype.validate.mockResolvedValue(true);
					ISOTimeType.prototype.validate.mockResolvedValue(false);
					expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(false);
				});

				test('should resolve as true if everything is valid', async () => {
					ISOCalendarDateType.prototype.validate.mockResolvedValue(true);
					ISOTimeType.prototype.validate.mockResolvedValue(true);
					expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(true);
				});
			});
		});
	});
});
