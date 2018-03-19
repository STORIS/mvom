/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import ISOCalendarDateTimeType, { __RewireAPI__ as RewireAPI } from './';

describe('ISOCalendarDateTimeType', () => {
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

			it("should return null if the input value isn't provided", () => {
				assert.isNull(isoCalendarDateTimeType.transformFromDb());
			});

			it('should return a interpolated string of the results from the Date and Time classes', () => {
				assert.strictEqual(isoCalendarDateTimeType.transformFromDb('foo.bar'), 'fooTbar');
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
				dateTransformToDb.resetHistory();
				timeTransformToDb.resetHistory();
			});

			it('should call the date and time classes with the split values from the datetime', () => {
				isoCalendarDateTimeType.transformToDb('1999-12-31T12:00:00.000');
				assert.isTrue(dateTransformToDb.calledWith('1999-12-31'));
				assert.isTrue(timeTransformToDb.calledWith('12:00:00.000'));
			});

			it('should return null if parameter is null', () => {
				assert.isNull(isoCalendarDateTimeType.transformToDb(null));
			});

			it('should return a interpolated string of the results from the Date and Time classes', () => {
				assert.strictEqual(isoCalendarDateTimeType.transformToDb('fooTbar'), 'foo.bar');
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
				dateValidate.reset();
				timeValidate.reset();
			});

			it('should resolve as true if value is undefined', async () => {
				assert.isTrue(await isoCalendarDateTimeType._validateType());
			});

			it('should resolve as true if value is null', async () => {
				assert.isTrue(await isoCalendarDateTimeType._validateType(null));
			});

			it('should resolve as false if value is not a string', async () => {
				assert.isFalse(await isoCalendarDateTimeType._validateType(1337));
			});

			it('should resolve as false if datePart is empty string', async () => {
				assert.isFalse(await isoCalendarDateTimeType._validateType('Tfoo'));
			});

			it('should resolve as false if timePart is empty string', async () => {
				assert.isFalse(await isoCalendarDateTimeType._validateType('fooT'));
			});

			it('should resolve as false if timePart is undefined', async () => {
				assert.isFalse(await isoCalendarDateTimeType._validateType('foo'));
			});

			it('should resolve as false if datePart is not valid', async () => {
				dateValidate.resolves(false);
				timeValidate.resolves(true);
				assert.isFalse(await isoCalendarDateTimeType._validateType('fooTbar'));
			});

			it('should resolve as false if timePart is not valid', async () => {
				dateValidate.resolves(true);
				timeValidate.resolves(false);
				assert.isFalse(await isoCalendarDateTimeType._validateType('fooTbar'));
			});

			it('should resolve as true if everything is valid', async () => {
				dateValidate.resolves(true);
				timeValidate.resolves(true);
				assert.isTrue(await isoCalendarDateTimeType._validateType('fooTbar'));
			});
		});
	});
});
