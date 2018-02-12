/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import ArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('ArrayType', () => {
	const SimpleType = class {
		get = stub();
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
		const castArray = stub();
		let simpleType;
		let arrayType;
		before(() => {
			RewireAPI.__Rewire__('castArray', castArray);
			simpleType = new SimpleType();
			arrayType = new ArrayType(simpleType);
		});

		beforeEach(() => {
			castArray.resetHistory();
			simpleType.get.reset();
		});

		after(() => {
			RewireAPI.__ResetDependency__('castArray');
		});

		describe('get', () => {
			it("should call the get method of the array's schemaType", () => {
				arrayType.get('foo');
				assert.isTrue(simpleType.get.calledWith('foo'));
			});

			it("should call castArray against the results of the array's schemaType get method", () => {
				simpleType.get.returnsArg(0);
				arrayType.get('foo');
				assert.isTrue(castArray.calledWith('foo'));
			});
		});
	});
});
