import { assert } from 'chai';
import { stub } from 'sinon';
import ISOCalendarDateTimeType, { __RewireAPI__ as RewireAPI } from './';

describe('ISOCalendarDateTime', () => {
	describe('constructor', () => {
		it('should throw if a path is not provided in the definition', () => {
			assert.throws(() => new ISOCalendarDateTimeType({}));
		});

		it('should not throw if a path is provided in the definition', () => {
			assert.doesNotThrow(() => new ISOCalendarDateTimeType({ path: '1' }));
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

			before(() => {
				isoCalendarDateTimeType = new ISOCalendarDateTimeType({ path: '1' });
				RewireAPI.__Rewire__('ISOCalendarDateType', ISOCalendarDateType);
				RewireAPI.__Rewire__('ISOTimeType', ISOTimeType);
			});

			after(() => {
				RewireAPI.__ResetDependency__('ISOCalendarDateType');
				RewireAPI.__ResetDependency__('ISOTimeType');
			});

			beforeEach(() => {
				dateTransformFromDb.resetHistory();
				timeTransformFromDb.resetHistory();
			});

			it('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformFromDb(12345.6789);
				assert.isTrue(dateTransformFromDb.calledWith(12345));
				assert.isTrue(timeTransformFromDb.calledWith(6789));
			});

			it('should return a interpolated string of the results from the Date and Time classes', () => {
				assert.strictEqual(isoCalendarDateTimeType.transformFromDb(), 'fooTbar');
			});
		});
	});
});
