import { assert } from 'chai';
import { stub } from 'sinon';
import ISOCalendarDate, { __RewireAPI__ as RewireAPI } from './';

describe('ISOCalendarDate', () => {
	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let isoCalendarDateType;
			const add = stub().returnsThis();
			const moment = stub().returns({
				format: stub().returnsThis(),
				add,
			});
			before(() => {
				isoCalendarDateType = new ISOCalendarDate({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			after(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				add.resetHistory();
			});

			it('should throw if value is not an integer', () => {
				assert.throws(isoCalendarDateType.transformFromDb.bind(isoCalendarDateType, 'foo'));
			});

			it("should return null if the input value isn't provided", () => {
				assert.isNull(isoCalendarDateType.transformFromDb());
			});

			it('should add the number of days specified by value to the moment', () => {
				isoCalendarDateType.transformFromDb(1000);
				assert.isTrue(add.calledWith(1000, 'days'));
			});
		});

		describe('transformToDb', () => {
			let isoCalendarDateType;
			const diff = stub();
			const moment = stub().returns({
				startOf: stub().returnsThis(),
				diff,
			});
			before(() => {
				isoCalendarDateType = new ISOCalendarDate({ path: '1' });
				RewireAPI.__Rewire__('moment', moment);
			});

			after(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				diff.reset();
				moment.resetHistory();
			});

			it('should return null if null parameter passed', () => {
				assert.isNull(isoCalendarDateType.transformToDb(null));
			});

			it('should calculate moment difference in days', () => {
				isoCalendarDateType.transformToDb('foo');
				assert.strictEqual(diff.args[0][1], 'days');
			});

			it('should create a new moment based on the passed value', () => {
				isoCalendarDateType.transformToDb('foo');
				assert.isTrue(moment.calledWith('foo'));
			});

			it('should return the string value returned from moment.diff', () => {
				diff.returns(1234);
				assert.strictEqual(isoCalendarDateType.transformToDb('foo'), '1234');
			});
		});
	});
});
