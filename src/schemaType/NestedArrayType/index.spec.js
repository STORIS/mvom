/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import SimpleType from 'schemaType/SimpleType';
import NestedArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('NestedArrayType', () => {
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
	before(() => {
		RewireAPI.__Rewire__('handleRequiredValidation', handleRequiredValidation);
	});

	after(() => {
		__rewire_reset_all__();
	});

	describe('instance methods', () => {
		describe('get', () => {
			const castArraySpy = spy(castArray);
			let simpleType;
			let nestedArrayType;
			before(() => {
				RewireAPI.__Rewire__('castArray', castArraySpy);
				simpleType = new SimpleTypeExtended({});
				simpleType.transformFromDb.withArgs('foo').returns('def');
				simpleType.transformFromDb.withArgs('bar').returns('henk');
				simpleType.transformFromDb.withArgs('baz').returns('mos');
				simpleType.transformFromDb.withArgs('qux').returns('thud');
				nestedArrayType = new NestedArrayType(simpleType);
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
				assert.deepEqual(nestedArrayType.get(), []);
			});

			it('should return a transformed nested array when given a primitive value ', () => {
				simpleType.getFromMvData.returns('foo');
				assert.deepEqual(nestedArrayType.get(), [['def']]);
			});

			it('should return a transformed nested array when given an unnested array of length 1', () => {
				simpleType.getFromMvData.returns(['foo']);
				assert.deepEqual(nestedArrayType.get(), [['def']]);
			});

			it('should return a transformed nested array when given an unnested array of greater than 1', () => {
				simpleType.getFromMvData.returns(['foo', 'bar']);
				assert.deepEqual(nestedArrayType.get(), [['def'], ['henk']]);
			});

			it('should return a transformed nested array when given a single nested array', () => {
				simpleType.getFromMvData.returns([['foo', 'bar']]);
				assert.deepEqual(nestedArrayType.get(), [['def', 'henk']]);
			});

			it('should return a transformed nested array when given more than one nested array', () => {
				simpleType.getFromMvData.returns([['foo', 'bar'], ['baz', 'qux']]);
				assert.deepEqual(nestedArrayType.get(), [['def', 'henk'], ['mos', 'thud']]);
			});
		});

		describe('set', () => {
			let simpleType;
			let nestedArrayType;
			before(() => {
				simpleType = new SimpleTypeExtended({});
				simpleType.transformToDb.withArgs('foo').returns('def');
				simpleType.transformToDb.withArgs('bar').returns('henk');
				simpleType.transformToDb.withArgs('baz').returns('mos');
				simpleType.transformToDb.withArgs('qux').returns('thud');
				nestedArrayType = new NestedArrayType(simpleType);
			});

			beforeEach(() => {
				simpleType.setIntoMvData.reset();
				simpleType.transformToDb.resetHistory();
			});

			it('should call transformToDb with each nested array value passed', () => {
				nestedArrayType.set([], [['foo', 'bar'], ['baz', 'qux']]);
				assert.strictEqual(simpleType.transformToDb.args[0][0], 'foo');
				assert.strictEqual(simpleType.transformToDb.args[1][0], 'bar');
				assert.strictEqual(simpleType.transformToDb.args[2][0], 'baz');
				assert.strictEqual(simpleType.transformToDb.args[3][0], 'qux');
			});

			it('should call setIntoMvData with results of transformToDb call', () => {
				nestedArrayType.set([], [['foo', 'bar'], ['baz', 'qux']]);
				assert.deepEqual(simpleType.setIntoMvData.args[0][1], [['def', 'henk'], ['mos', 'thud']]);
			});

			it('should return value returned from setIntoMvData', () => {
				simpleType.setIntoMvData.returns('foo');
				assert.strictEqual(nestedArrayType.set([], [[]]), 'foo');
			});
		});

		describe('validate', () => {
			let simpleType;
			let nestedArrayType;
			const fooValidator = stub();
			const barValidator = stub();
			before(() => {
				simpleType = new SimpleTypeExtended({});
				nestedArrayType = new NestedArrayType(simpleType);
				nestedArrayType._validators.push({ validator: fooValidator, message: 'foo' });
				nestedArrayType._validators.push({ validator: barValidator, message: 'bar' });
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
				assert.deepEqual(await nestedArrayType.validate([]), ['requiredValidator']);
			});

			it('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				simpleType.validate.resolves([]);
				assert.deepEqual(await nestedArrayType.validate([]), ['foo', 'requiredValidator']);
			});

			it('should return an array of errors from simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.resolves(['baz', 'qux']);
				assert.deepEqual(await nestedArrayType.validate(['value1']), ['baz', 'qux']);
			});

			it('should return an array of errors from multiple calls into the simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				assert.deepEqual(await nestedArrayType.validate([['value1'], ['value2']]), [
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			it('should return an array of errors from multiple calls into the simpleType validator from nested array elements', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				simpleType.validate.onCall(2).resolves(['uier', 'grault']);
				simpleType.validate.onCall(3).resolves(['garply', 'waldo']);
				assert.deepEqual(
					await nestedArrayType.validate([['value1', 'value2'], ['value3', 'value4']]),
					['baz', 'qux', 'quux', 'corge', 'uier', 'grault', 'garply', 'waldo'],
				);
			});

			it('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				assert.deepEqual(await nestedArrayType.validate([['value1'], ['value2']]), [
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
					assert.deepEqual(await nestedArrayType.validate([['value1'], ['value2', 'value3']]), [
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
				assert.deepEqual(await nestedArrayType.validate([]), []);
			});
		});
	});
});
