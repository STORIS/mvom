import { stub } from 'sinon';
import BasePrimitiveArrayType, { __RewireAPI__ as RewireAPI } from './BasePrimitiveArrayType';

describe('BasePrimitiveArrayType', () => {
	class SimpleType {
		transformToQuery = stub();

		definition = {};
	}

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
		describe('cast', () => {
			let extension;
			beforeAll(() => {
				class Extension extends BasePrimitiveArrayType {}
				extension = new Extension(new SimpleType());
			});

			test('should return empty array if cast value is null', () => {
				expect(extension.cast(null)).toEqual([]);
			});

			test('should return original value if cast value is non-null and an array', () => {
				expect(extension.cast(['foo'])).toEqual(['foo']);
			});

			test('should return primitive cast to array', () => {
				expect(extension.cast('foo')).toEqual(['foo']);
			});
		});

		describe('get', () => {
			let extension;
			beforeAll(() => {
				class Extension extends BasePrimitiveArrayType {}
				extension = new Extension(new SimpleType());
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.get).toThrow();
			});
		});

		describe('set', () => {
			let extension;
			beforeAll(() => {
				class Extension extends BasePrimitiveArrayType {}
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
				class Extension extends BasePrimitiveArrayType {}
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
				class Extension extends BasePrimitiveArrayType {}
				extension = new Extension(new SimpleType());
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.validate).toThrow();
			});
		});
	});
});
