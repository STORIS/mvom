/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import ISOTimeType, { __RewireAPI__ as RewireAPI } from './ISOTimeType';

describe('ISOTimeType', () => {
	describe('constructor', () => {
		test("should set _isDbInMs to true if dbFormat is 'ms'", () => {
			const isoTimeType = new ISOTimeType({ path: '1', dbFormat: 'ms' });
			expect(isoTimeType._isDbInMs).toBe(true);
		});

		test('should set _isDbInMs to false if dbFormat is not specified', () => {
			const isoTimeType = new ISOTimeType({ path: '1' });
			expect(isoTimeType._isDbInMs).toBe(false);
		});

		test("should set _isDbInMs to false if dbFormat is anything other than 'ms'", () => {
			const isoTimeType = new ISOTimeType({ path: '1', dbFormat: 'foo' });
			expect(isoTimeType._isDbInMs).toBe(false);
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let isoTimeType;
			const add = stub().returnsThis();
			const moment = stub().returns({
				startOf: stub().returnsThis(),
				format: stub().returnsThis(),
				add,
			});
			beforeAll(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isoTimeType._isDbInMs = false;
				add.resetHistory();
			});

			test('should throw if value is not an integer', () => {
				expect(isoTimeType.transformFromDb.bind(isoTimeType, 'foo')).toThrow();
			});

			test('should throw if value is less than zero', () => {
				expect(isoTimeType.transformFromDb.bind(isoTimeType, -1)).toThrow();
			});

			test('should throw if _isDbInMs is true and value is greater than 86400000', () => {
				isoTimeType._isDbInMs = true;
				expect(isoTimeType.transformFromDb.bind(isoTimeType, 86400001)).toThrow();
			});

			test('should throw if _isDbInMs is true and value is greater than 86400', () => {
				isoTimeType._isDbInMs = false;
				expect(isoTimeType.transformFromDb.bind(isoTimeType, 86401)).toThrow();
			});

			test("should return null if the input value isn't provided", () => {
				expect(isoTimeType.transformFromDb()).toBeNull();
			});

			test('should add the number of milliseconds specified by value to the moment', () => {
				isoTimeType._isDbInMs = true;
				isoTimeType.transformFromDb(1000);
				expect(add.calledWith(1000, 'milliseconds')).toBe(true);
			});

			test('should add the number of seconds specified by value to the moment', () => {
				isoTimeType._isDbInMs = false;
				isoTimeType.transformFromDb(1000);
				expect(add.calledWith(1000, 'seconds')).toBe(true);
			});
		});

		describe('transformToDb', () => {
			let isoTimeType;
			const moment = stub().returns({
				startOf: stub().returnsThis(),
				diff: stub().returnsArg(1),
			});
			beforeAll(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isoTimeType._isDbInMs = false;
			});

			test('should return null if passed value is null', () => {
				expect(isoTimeType.transformToDb(null)).toBeNull();
			});

			test('should transform to milliseconds if db format is in milliseconds', () => {
				isoTimeType._isDbInMs = true;
				expect(isoTimeType.transformToDb('HH:mm:ss.SSS')).toBe('milliseconds');
			});

			test('should transform to seconds if db format is in seconds', () => {
				isoTimeType._isDbInMs = false;
				expect(isoTimeType.transformToDb('HH:mm:ss.SSS')).toBe('seconds');
			});
		});

		describe('_validateType', () => {
			let isoTimeType;
			const isValid = stub();
			const moment = stub().returns({
				isValid,
			});
			beforeAll(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isValid.reset();
			});

			test('should resolve as true if value is undefined', async () => {
				expect(await isoTimeType._validateType()).toBe(true);
			});

			test('should resolve as true if value is null', async () => {
				expect(await isoTimeType._validateType(null)).toBe(true);
			});

			test('should resolve as true if time value is valid', async () => {
				isValid.returns(true);
				expect(await isoTimeType._validateType('foo')).toBe(true);
			});

			test('should resolve as false if time value is invalid', async () => {
				isValid.returns(false);
				expect(await isoTimeType._validateType('foo')).toBe(false);
			});
		});
	});
});
