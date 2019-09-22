/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import ISOCalendarDate, { __RewireAPI__ as RewireAPI } from './ISOCalendarDateType';

describe('ISOCalendarDate', () => {
	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let isoCalendarDateType;
			const add = stub().returnsThis();
			const moment = stub().returns({
				format: stub().returnsThis(),
				add,
			});
			beforeAll(() => {
				isoCalendarDateType = new ISOCalendarDate({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				add.resetHistory();
			});

			test('should throw if value is not an integer', () => {
				expect(isoCalendarDateType.transformFromDb.bind(isoCalendarDateType, 'foo')).toThrow();
			});

			test("should return null if the input value isn't provided", () => {
				expect(isoCalendarDateType.transformFromDb()).toBeNull();
			});

			test('should add the number of days specified by value to the moment', () => {
				isoCalendarDateType.transformFromDb(1000);
				expect(add.calledWith(1000, 'days')).toBe(true);
			});
		});

		describe('transformToDb', () => {
			let isoCalendarDateType;
			const diff = stub();
			const moment = stub().returns({
				startOf: stub().returnsThis(),
				diff,
			});
			beforeAll(() => {
				isoCalendarDateType = new ISOCalendarDate({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				diff.reset();
				moment.resetHistory();
			});

			test('should return null if null parameter passed', () => {
				expect(isoCalendarDateType.transformToDb(null)).toBeNull();
			});

			test('should calculate moment difference in days', () => {
				isoCalendarDateType.transformToDb('foo');
				expect(diff.args[0][1]).toBe('days');
			});

			test('should create a new moment based on the passed value', () => {
				isoCalendarDateType.transformToDb('foo');
				expect(moment.calledWith('foo')).toBe(true);
			});

			test('should return the string value returned from moment.diff', () => {
				diff.returns(1234);
				expect(isoCalendarDateType.transformToDb('foo')).toBe('1234');
			});
		});

		describe('_validateType', () => {
			let isoCalendarDateType;
			const isValid = stub();
			const moment = stub().returns({
				isValid,
			});
			beforeAll(() => {
				isoCalendarDateType = new ISOCalendarDate({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isValid.reset();
			});

			test('should resolve as true if value is undefined', async () => {
				expect(await isoCalendarDateType._validateType()).toBe(true);
			});

			test('should resolve as true if value is null', async () => {
				expect(await isoCalendarDateType._validateType(null)).toBe(true);
			});

			test('should resolve as true if time value is valid', async () => {
				isValid.returns(true);
				expect(await isoCalendarDateType._validateType('foo')).toBe(true);
			});

			test('should resolve as false if time value is invalid', async () => {
				isValid.returns(false);
				expect(await isoCalendarDateType._validateType('foo')).toBe(false);
			});
		});
	});
});
