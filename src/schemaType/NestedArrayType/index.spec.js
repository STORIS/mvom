/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import NestedArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('NestedArrayType', () => {
	const SimpleType = class {
		getFromMvData = stub();
		setIntoMvData = stub();
		transformFromDb = stub();
		transformToDb = stub();
	};
	before(() => {
		RewireAPI.__Rewire__('SimpleType', SimpleType);
	});

	after(() => {
		RewireAPI.__ResetDependency__('SimpleType');
	});

	describe('constructor', () => {
		it('should throw when valueSchemaType is not an instance of SimpleType', () => {
			assert.throws(() => new NestedArrayType('foo'));
		});

		it('should set _valueSchemaType instance member', () => {
			const nestedArrayType = new NestedArrayType(new SimpleType());
			assert.instanceOf(nestedArrayType._valueSchemaType, SimpleType);
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			const castArraySpy = spy(castArray);
			let simpleType;
			let nestedArrayType;
			before(() => {
				RewireAPI.__Rewire__('castArray', castArraySpy);
				simpleType = new SimpleType({});
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
				simpleType = new SimpleType({});
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
	});
});
