/* eslint-disable no-underscore-dangle */
import { castArray } from 'lodash';
import { spy, stub } from 'sinon';
import SimpleType from './SimpleType';
/* eslint-disable-next-line import/named */
import ArrayType, { __RewireAPI__ as RewireAPI } from './ArrayType';

describe('ArrayType', () => {
	const SimpleTypeExtended = class extends SimpleType {
		getFromMvData = stub();

		setIntoMvData = stub();

		transformFromDb = stub();

		transformToDb = stub();

		validate = stub();

		definition = {};
	};

	const requiredValidator = stub();
	const handleRequiredValidation = stub().returns({
		validator: requiredValidator,
		message: 'requiredValidator',
	});
	beforeAll(() => {
		RewireAPI.__Rewire__('handleRequiredValidation', handleRequiredValidation);
	});

	afterAll(() => {
		__rewire_reset_all__();
	});

	describe('instance methods', () => {
		describe('get', () => {
			const castArraySpy = spy(castArray);
			let simpleType;
			let arrayType;
			beforeAll(() => {
				RewireAPI.__Rewire__('castArray', castArraySpy);
				simpleType = new SimpleTypeExtended({});
				simpleType.transformFromDb.withArgs('foo').returns('def');
				simpleType.transformFromDb.withArgs('bar').returns('henk');
				arrayType = new ArrayType(simpleType);
			});

			beforeEach(() => {
				castArraySpy.resetHistory();
				simpleType.getFromMvData.reset();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('castArray');
			});

			test('should return an empty array when given undefined', () => {
				simpleType.getFromMvData.returns(undefined);
				expect(arrayType.get()).toEqual([]);
			});

			test('should return a transformed array when given a primitive value ', () => {
				simpleType.getFromMvData.returns('foo');
				expect(arrayType.get()).toEqual(['def']);
			});

			test('should return a transformed array when given an array of length 1', () => {
				simpleType.getFromMvData.returns(['foo']);
				expect(arrayType.get()).toEqual(['def']);
			});

			test('should return a transformed array when given an array of greater than 1', () => {
				simpleType.getFromMvData.returns(['foo', 'bar']);
				expect(arrayType.get()).toEqual(['def', 'henk']);
			});
		});

		describe('set', () => {
			let simpleType;
			let arrayType;
			beforeAll(() => {
				simpleType = new SimpleTypeExtended({});
				simpleType.transformToDb.withArgs('foo').returns('def');
				simpleType.transformToDb.withArgs('bar').returns('henk');
				arrayType = new ArrayType(simpleType);
			});

			beforeEach(() => {
				simpleType.setIntoMvData.reset();
				simpleType.transformToDb.resetHistory();
			});

			test('should call transformToDb with each array value passed', () => {
				arrayType.set([], ['foo', 'bar']);
				expect(simpleType.transformToDb.args[0][0]).toBe('foo');
				expect(simpleType.transformToDb.args[1][0]).toBe('bar');
			});

			test('should call setIntoMvData with results of transformToDb call', () => {
				arrayType.set([], ['foo', 'bar']);
				expect(simpleType.setIntoMvData.args[0][1]).toEqual(['def', 'henk']);
			});

			test('should return value returned from setIntoMvData', () => {
				simpleType.setIntoMvData.returns('foo');
				expect(arrayType.set([], [])).toBe('foo');
			});
		});

		describe('validate', () => {
			let simpleType;
			let arrayType;
			const fooValidator = stub();
			const barValidator = stub();
			beforeAll(() => {
				simpleType = new SimpleTypeExtended({});
				arrayType = new ArrayType(simpleType);
				arrayType._validators.push({ validator: fooValidator, message: 'foo' });
				arrayType._validators.push({ validator: barValidator, message: 'bar' });
			});

			beforeEach(() => {
				simpleType.validate.reset();
				fooValidator.reset();
				barValidator.reset();
				requiredValidator.reset();
			});

			test('should return an array of any errors from the required validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				simpleType.validate.resolves([]);
				expect(await arrayType.validate([])).toEqual(['requiredValidator']);
			});

			test('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				simpleType.validate.resolves([]);
				expect(await arrayType.validate([])).toEqual(['foo', 'requiredValidator']);
			});

			test('should return an array of errors from simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.resolves(['baz', 'qux']);
				expect(await arrayType.validate(['value1'])).toEqual(['baz', 'qux']);
			});

			test('should return an array of errors from multiple calls into the simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				expect(await arrayType.validate(['value1', 'value2'])).toEqual([
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				expect(await arrayType.validate(['value1', 'value2'])).toEqual([
					'foo',
					'bar',
					'requiredValidator',
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an array of errors from all validators when a simpleType validator returns no errors', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves([]);
				simpleType.validate.onCall(2).resolves(['quux', 'corge']);
				expect(await arrayType.validate(['value1', 'value2', 'value3'])).toEqual([
					'foo',
					'bar',
					'requiredValidator',
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an empty array if no errors are found', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.resolves([]);
				expect(await arrayType.validate([])).toEqual([]);
			});
		});
	});
});
