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
	};
	before(() => {
		RewireAPI.__Rewire__('SimpleType', SimpleType);
	});

	after(() => {
		RewireAPI.__ResetDependency__('SimpleType');
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
	});
});
