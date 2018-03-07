/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import ISOTimeType, { __RewireAPI__ as RewireAPI } from './';

describe('ISOTimeType', () => {
	describe('constructor', () => {
		it("should set _isDbInMs to true if dbFormat is 'ms'", () => {
			const isoTimeType = new ISOTimeType({ path: '1', dbFormat: 'ms' });
			assert.isTrue(isoTimeType._isDbInMs);
		});

		it('should set _isDbInMs to false if dbFormat is not specified', () => {
			const isoTimeType = new ISOTimeType({ path: '1' });
			assert.isFalse(isoTimeType._isDbInMs);
		});

		it("should set _isDbInMs to false if dbFormat is anything other than 'ms'", () => {
			const isoTimeType = new ISOTimeType({ path: '1', dbFormat: 'foo' });
			assert.isFalse(isoTimeType._isDbInMs);
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
			before(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			after(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isoTimeType._isDbInMs = false;
				add.resetHistory();
			});

			it('should throw if value is not an integer', () => {
				assert.throws(isoTimeType.transformFromDb.bind(isoTimeType, 'foo'));
			});

			it('should throw if value is less than zero', () => {
				assert.throws(isoTimeType.transformFromDb.bind(isoTimeType, -1));
			});

			it('should throw if _isDbInMs is true and value is greater than 86400000', () => {
				isoTimeType._isDbInMs = true;
				assert.throws(isoTimeType.transformFromDb.bind(isoTimeType, 86400001));
			});

			it('should throw if _isDbInMs is true and value is greater than 86400', () => {
				isoTimeType._isDbInMs = false;
				assert.throws(isoTimeType.transformFromDb.bind(isoTimeType, 86401));
			});

			it("should return null if the input value isn't provided", () => {
				assert.isNull(isoTimeType.transformFromDb());
			});

			it('should add the number of milliseconds specified by value to the moment', () => {
				isoTimeType._isDbInMs = true;
				isoTimeType.transformFromDb(1000);
				assert.isTrue(add.calledWith(1000, 'milliseconds'));
			});

			it('should add the number of seconds specified by value to the moment', () => {
				isoTimeType._isDbInMs = false;
				isoTimeType.transformFromDb(1000);
				assert.isTrue(add.calledWith(1000, 'seconds'));
			});
		});

		describe('transformToDb', () => {
			let isoTimeType;
			const moment = stub().returns({
				startOf: stub().returnsThis(),
				diff: stub().returnsArg(1),
			});
			before(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			after(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isoTimeType._isDbInMs = false;
			});

			it('should return null if passed value is null', () => {
				assert.isNull(isoTimeType.transformToDb(null));
			});

			it('should transform to milliseconds if db format is in milliseconds', () => {
				isoTimeType._isDbInMs = true;
				assert.strictEqual(isoTimeType.transformToDb('HH:mm:ss.SSS'), 'milliseconds');
			});

			it('should transform to seconds if db format is in seconds', () => {
				isoTimeType._isDbInMs = false;
				assert.strictEqual(isoTimeType.transformToDb('HH:mm:ss.SSS'), 'seconds');
			});
		});

		describe('_validateType', () => {
			let isoTimeType;
			const isValid = stub();
			const moment = stub().returns({
				isValid,
			});
			before(() => {
				isoTimeType = new ISOTimeType({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			after(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				isValid.reset();
			});

			it('should resolve as true if value is undefined', async () => {
				assert.isTrue(await isoTimeType._validateType());
			});

			it('should resolve as true if value is null', async () => {
				assert.isTrue(await isoTimeType._validateType(null));
			});

			it('should resolve as true if time value is valid', async () => {
				isValid.returns(true);
				assert.isTrue(await isoTimeType._validateType('foo'));
			});

			it('should resolve as false if time value is invalid', async () => {
				isValid.returns(false);
				assert.isFalse(await isoTimeType._validateType('foo'));
			});
		});
	});
});
