/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import BasePrimitiveArrayType, { __RewireAPI__ as RewireAPI } from './BasePrimitiveArrayType';

describe('BasePrimitiveArrayType', () => {
	const SimpleType = class {
		transformToQuery = stub();

		definition = {};
	};

	class DisallowDirectError extends Error {}
	class InvalidParameterError extends Error {}
	class NotImplementedError extends Error {}

	beforeAll(() => {
		RewireAPI.__Rewire__('SimpleType', SimpleType);
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
	});

	afterAll(() => {
		__rewire_reset_all__();
	});

	describe('constructor', () => {
		class Extension extends BasePrimitiveArrayType {}
		test('should not be able to instantiate directly', () => {
			expect(() => new BasePrimitiveArrayType()).toThrow();
		});

		test('should throw InvalidParameterError when valueSchemaType is not an instance of SimpleType', () => {
			expect(() => new Extension('foo')).toThrow();
		});

		test('should set _valueSchemaType instance member', () => {
			const arrayType = new Extension(new SimpleType());
			expect(arrayType._valueSchemaType).toBeInstanceOf(SimpleType);
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			let extension;
			beforeAll(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.get).toThrow();
			});
		});

		describe('set', () => {
			let extension;
			beforeAll(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.set).toThrow();
			});
		});

		describe('transformToQuery', () => {
			let extension;
			let simpleType;
			beforeAll(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				simpleType = new SimpleType();
				extension = new Extension(simpleType);
			});

			beforeEach(() => {
				simpleType.transformToQuery.resetHistory();
			});

			test('should call the _valueSchemaType transformToQuery function', () => {
				extension.transformToQuery();
				expect(simpleType.transformToQuery.calledOnce).toBe(true);
			});

			test('should call the _valueSchemaType transformToQuery function with the passed value', () => {
				extension.transformToQuery('foo');
				expect(simpleType.transformToQuery.calledWith('foo')).toBe(true);
			});
		});

		describe('validate', () => {
			let extension;
			beforeAll(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				extension = new Extension(new SimpleType());
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.validate).toThrow();
			});
		});

		describe('_validateRequired', () => {
			let simpleType;
			let arrayType;
			beforeAll(() => {
				const Extension = class extends BasePrimitiveArrayType {};
				simpleType = new SimpleType({});
				arrayType = new Extension(simpleType);
			});

			test('should resolve as false if array is empty', async () => {
				expect(await arrayType._validateRequired([])).toBe(false);
			});

			test('should resolve as true if array is not empty', async () => {
				expect(await arrayType._validateRequired(['foo'])).toBe(true);
			});
		});
	});
});
