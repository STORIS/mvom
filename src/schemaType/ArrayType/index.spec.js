/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import ArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('ArrayType', () => {
	const SimpleType = class {
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
	before(() => {
		RewireAPI.__Rewire__('SimpleType', SimpleType);
		RewireAPI.__Rewire__('handleRequiredValidation', handleRequiredValidation);
	});

	after(() => {
		RewireAPI.__ResetDependency__('SimpleType');
		RewireAPI.__ResetDependency__('handleRequiredValidation');
	});

	describe('constructor', () => {
		it('should throw when valueSchemaType is not an instance of SimpleType', () => {
			assert.throws(() => new ArrayType('foo'));
		});

		it('should set _valueSchemaType instance member', () => {
			const arrayType = new ArrayType(new SimpleType());
			assert.instanceOf(arrayType._valueSchemaType, SimpleType);
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			const castArraySpy = spy(castArray);
			let simpleType;
			let arrayType;
			before(() => {
				RewireAPI.__Rewire__('castArray', castArraySpy);
				simpleType = new SimpleType({});
				simpleType.transformFromDb.withArgs('foo').returns('def');
				simpleType.transformFromDb.withArgs('bar').returns('henk');
				arrayType = new ArrayType(simpleType);
			});

			beforeEach(() => {
				castArraySpy.resetHistory();
				simpleType.getFromMvData.reset();
			});

			after(() => {
				RewireAPI.__ResetDependency__('castArray');
			});

			it('should return an empty array when given undefined', () => {
				simpleType.getFromMvData.returns(undefined);
				assert.deepEqual(arrayType.get(), []);
			});

			it('should return a transformed array when given a primitive value ', () => {
				simpleType.getFromMvData.returns('foo');
				assert.deepEqual(arrayType.get(), ['def']);
			});

			it('should return a transformed array when given an array of length 1', () => {
				simpleType.getFromMvData.returns(['foo']);
				assert.deepEqual(arrayType.get(), ['def']);
			});

			it('should return a transformed array when given an array of greater than 1', () => {
				simpleType.getFromMvData.returns(['foo', 'bar']);
				assert.deepEqual(arrayType.get(), ['def', 'henk']);
			});
		});

		describe('set', () => {
			let simpleType;
			let arrayType;
			before(() => {
				simpleType = new SimpleType({});
				simpleType.transformToDb.withArgs('foo').returns('def');
				simpleType.transformToDb.withArgs('bar').returns('henk');
				arrayType = new ArrayType(simpleType);
			});

			beforeEach(() => {
				simpleType.setIntoMvData.reset();
				simpleType.transformToDb.resetHistory();
			});

			it('should call transformToDb with each array value passed', () => {
				arrayType.set([], ['foo', 'bar']);
				assert.strictEqual(simpleType.transformToDb.args[0][0], 'foo');
				assert.strictEqual(simpleType.transformToDb.args[1][0], 'bar');
			});

			it('should call setIntoMvData with results of transformToDb call', () => {
				arrayType.set([], ['foo', 'bar']);
				assert.deepEqual(simpleType.setIntoMvData.args[0][1], ['def', 'henk']);
			});

			it('should return value returned from setIntoMvData', () => {
				simpleType.setIntoMvData.returns('foo');
				assert.strictEqual(arrayType.set([], []), 'foo');
			});
		});

		describe('validate', () => {
			let simpleType;
			let arrayType;
			const fooValidator = stub();
			const barValidator = stub();
			before(() => {
				simpleType = new SimpleType({});
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

			it('should return an array of any errors from the required validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				simpleType.validate.resolves([]);
				assert.deepEqual(await arrayType.validate([]), ['requiredValidator']);
			});

			it('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				simpleType.validate.resolves([]);
				assert.deepEqual(await arrayType.validate([]), ['foo', 'requiredValidator']);
			});

			it('should return an array of errors from simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.resolves(['baz', 'qux']);
				assert.deepEqual(await arrayType.validate(['value1']), ['baz', 'qux']);
			});

			it('should return an array of errors from multiple calls into the simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				assert.deepEqual(await arrayType.validate(['value1', 'value2']), [
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			it('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				assert.deepEqual(await arrayType.validate(['value1', 'value2']), [
					'foo',
					'bar',
					'requiredValidator',
					'baz',
					'qux',
					'quux',
					'corge',
				]);

				it('should return an array of errors from all validators when a simpleType validator returns no errors', async () => {
					fooValidator.resolves(false);
					barValidator.resolves(false);
					requiredValidator.resolves(false);
					simpleType.validate.onCall(0).resolves(['baz', 'qux']);
					simpleType.validate.onCall(1).resolves([]);
					simpleType.validate.onCall(2).resolves(['quux', 'corge']);
					assert.deepEqual(await arrayType.validate(['value1', 'value2', 'value3']), [
						'foo',
						'bar',
						'requiredValidator',
						'baz',
						'qux',
						'quux',
						'corge',
					]);
				});
			});

			it('should return an empty array if no errors are found', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.resolves([]);
				assert.deepEqual(await arrayType.validate([]), []);
			});
		});

		describe('_validateRequired', () => {
			let simpleType;
			let arrayType;
			before(() => {
				simpleType = new SimpleType({});
				arrayType = new ArrayType(simpleType);
			});

			it('should resolve as false if array is empty', async () => {
				assert.isFalse(await arrayType._validateRequired([]));
			});

			it('should resolve as true if array is not empty', async () => {
				assert.isTrue(await arrayType._validateRequired(['foo']));
			});
		});
	});
});
