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

			it('should add the number of days specified by value to the moment', () => {
				isoCalendarDateType.transformFromDb(1000);
				assert.isTrue(add.calledWith(1000, 'days'));
			});
		});
	});
});
