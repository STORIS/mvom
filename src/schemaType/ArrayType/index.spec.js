/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import ArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('ArrayType', () => {
	const SimpleType = class {
		getFromMvData = stub();
		transformFromDb = stub();
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

		describe('get', () => {
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
	});
});
