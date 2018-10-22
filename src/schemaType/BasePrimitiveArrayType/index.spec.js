/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import BasePrimitiveArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('BasePrimitiveArrayType', () => {
	const SimpleType = class {
		transformToQuery = stub();
		definition = {};
	};

	class DisallowDirectError extends Error {}
	class InvalidParameterError extends Error {}
	class NotImplementedError extends Error {}

	before(() => {
		RewireAPI.__Rewire__('SimpleType', SimpleType);
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
	});

	after(() => {
		__rewire_reset_all__();
	});

	describe('constructor', () => {
		class Extension extends BasePrimitiveArrayType {}
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new BasePrimitiveArrayType(), DisallowDirectError);
		});

		it('should throw InvalidParameterError when valueSchemaType is not an instance of SimpleType', () => {
			assert.throws(() => new Extension('foo'), InvalidParameterError);
		});

		it('should set _valueSchemaType instance member', () => {
			const arrayType = new Extension(new SimpleType());
			assert.instanceOf(arrayType._valueSchemaType, SimpleType);
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			let extension;
			before(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.get, NotImplementedError);
			});
		});

		describe('set', () => {
			let extension;
			before(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.set, NotImplementedError);
			});
		});

		describe('transformToQuery', () => {
			let extension;
			let simpleType;
			before(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				simpleType = new SimpleType();
				extension = new Extension(simpleType);
			});

			beforeEach(() => {
				simpleType.transformToQuery.resetHistory();
			});

			it('should call the _valueSchemaType transformToQuery function', () => {
				extension.transformToQuery();
				assert.isTrue(simpleType.transformToQuery.calledOnce);
			});

			it('should call the _valueSchemaType transformToQuery function with the passed value', () => {
				extension.transformToQuery('foo');
				assert.isTrue(simpleType.transformToQuery.calledWith('foo'));
			});
		});

		describe('validate', () => {
			let extension;
			before(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.validate, NotImplementedError);
			});
		});

		describe('_validateRequired', () => {
			let simpleType;
			let arrayType;
			before(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				simpleType = new SimpleType({});
				arrayType = new Extension(simpleType);
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
