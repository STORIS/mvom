/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import ISOCalendarDateTimeType, { __RewireAPI__ as RewireAPI } from './ISOCalendarDateTimeType';

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
			let isoCalendarDateTimeType;
			const dateTransformFromDb = stub().returns('foo');
			const timeTransformFromDb = stub().returns('bar');
			const ISOCalendarDateType = class {
				transformFromDb = dateTransformFromDb;
			};
			const ISOTimeType = class {
				transformFromDb = timeTransformFromDb;
			};

			beforeAll(() => {
				isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
				RewireAPI.__Rewire__('ISOCalendarDateType', ISOCalendarDateType);
				RewireAPI.__Rewire__('ISOTimeType', ISOTimeType);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('ISOCalendarDateType');
				RewireAPI.__ResetDependency__('ISOTimeType');
			});

			beforeEach(() => {
				dateTransformFromDb.resetHistory();
				timeTransformFromDb.resetHistory();
			});

			test('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformFromDb(12345.6789);
				expect(dateTransformFromDb.calledWith(12345)).toBe(true);
				expect(timeTransformFromDb.calledWith(6789)).toBe(true);
			});

			test("should return null if the input value isn't provided", () => {
				expect(isoCalendarDateTimeType.transformFromDb()).toBeNull();
			});

			test('should return a interpolated string of the results from the Date and Time classes', () => {
				expect(isoCalendarDateTimeType.transformFromDb('foo.bar')).toBe('fooTbar');
			});
		});

		describe('transformToDb', () => {
			let isoCalendarDateTimeType;
			const dateTransformToDb = stub().returns('foo');
			const timeTransformToDb = stub().returns('bar');
			const ISOCalendarDateType = class {
				transformToDb = dateTransformToDb;
			};
			const ISOTimeType = class {
				transformToDb = timeTransformToDb;
			};

			beforeAll(() => {
				isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
				RewireAPI.__Rewire__('ISOCalendarDateType', ISOCalendarDateType);
				RewireAPI.__Rewire__('ISOTimeType', ISOTimeType);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('ISOCalendarDateType');
				RewireAPI.__ResetDependency__('ISOTimeType');
			});

			beforeEach(() => {
				dateTransformToDb.resetHistory();
				timeTransformToDb.resetHistory();
			});

			test('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformToDb('1999-12-31T12:00:00.000');
				expect(dateTransformToDb.calledWith('1999-12-31')).toBe(true);
				expect(timeTransformToDb.calledWith('12:00:00.000')).toBe(true);
			});

			test('should return null if parameter is null', () => {
				expect(isoCalendarDateTimeType.transformToDb(null)).toBeNull();
			});

			test('should return a interpolated string of the results from the Date and Time classes', () => {
				expect(isoCalendarDateTimeType.transformToDb('fooTbar')).toBe('foo.bar');
			});
		});

		describe('_validateType', () => {
			let isoCalendarDateTimeType;
			const dateValidate = stub();
			const timeValidate = stub();
			const ISOCalendarDateType = class {
				validate = dateValidate;
			};
			const ISOTimeType = class {
				validate = timeValidate;
			};

			beforeAll(() => {
				isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
				RewireAPI.__Rewire__('ISOCalendarDateType', ISOCalendarDateType);
				RewireAPI.__Rewire__('ISOTimeType', ISOTimeType);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('ISOCalendarDateType');
				RewireAPI.__ResetDependency__('ISOTimeType');
			});

			beforeEach(() => {
				dateValidate.reset();
				timeValidate.reset();
			});

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

			test('should resolve as false if datePart is not valid', async () => {
				dateValidate.resolves(false);
				timeValidate.resolves(true);
				expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(false);
			});

			test('should resolve as false if timePart is not valid', async () => {
				dateValidate.resolves(true);
				timeValidate.resolves(false);
				expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(false);
			});

			test('should resolve as true if everything is valid', async () => {
				dateValidate.resolves(true);
				timeValidate.resolves(true);
				expect(await isoCalendarDateTimeType._validateType('fooTbar')).toBe(true);
			});
		});
	});
});
