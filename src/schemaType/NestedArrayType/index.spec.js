/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import NestedArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('NestedArrayType', () => {
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
			assert.throws(() => new NestedArrayType('foo'));
		});

		it('should set _valueSchemaType instance member', () => {
			const nestedArrayType = new NestedArrayType(new SimpleType());
			assert.instanceOf(nestedArrayType._valueSchemaType, SimpleType);
		});
	});

	describe('instance methods', () => {
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

		describe('get', () => {
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
	});
});
