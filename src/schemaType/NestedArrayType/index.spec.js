import { assert } from 'chai';
import castArray from 'lodash/castArray';
import { spy, stub } from 'sinon';
import SimpleType from 'schemaType/SimpleType';
import NestedArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('NestedArrayType', () => {
	const Extension = class extends SimpleType {
		get = stub();
	};

	describe('constructor', () => {
		it('should throw when valueSchemaType is not an instance of SimpleType', () => {
			assert.throws(() => new NestedArrayType('foo'));
		});

		it('should not throw when valueSchemaType is an instance of a SimpleType child class', () => {
			// it would be preferable for SimpleType to be rewired for this test, but because both the unit under test
			// and its parent class test that the variable being passed to the constructor is an instance of SimpleType,
			// that can't be done
			assert.doesNotThrow(() => new NestedArrayType(new Extension({})));
		});
	});

	describe('instance methods', () => {
		const castArraySpy = spy(castArray);
		let nestedArrayType;
		let extension;
		before(() => {
			RewireAPI.__Rewire__('castArray', castArraySpy);
			extension = new Extension({});
			nestedArrayType = new NestedArrayType(extension);
		});

		beforeEach(() => {
			castArraySpy.reset();
			extension.get.reset();
		});

		after(() => {
			RewireAPI.__ResetDependency__('castArray');
		});

		describe('get', () => {
			it("should call castArray against the results of the array's schemaType get method", () => {
				extension.get.returns('foo');
				nestedArrayType.get();
				assert.strictEqual(castArraySpy.args[0][0], 'foo');
				assert.strictEqual(castArraySpy.args[1][0], 'foo');
			});

			it("should call castArray against each of the results of the array's schemaType get method", () => {
				extension.get.returns(['foo', 'bar']);
				nestedArrayType.get();
				assert.deepEqual(castArraySpy.args[0][0], ['foo', 'bar']);
				assert.strictEqual(castArraySpy.args[1][0], 'foo');
				assert.strictEqual(castArraySpy.args[2][0], 'bar');
			});

			it('should call castArray against each of the nested arrays returned from the schemaType get method', () => {
				extension.get.returns([['foo', 'bar'], ['baz', 'qux']]);
				nestedArrayType.get();
				assert.deepEqual(castArraySpy.args[0][0], [['foo', 'bar'], ['baz', 'qux']]);
				assert.deepEqual(castArraySpy.args[1][0], ['foo', 'bar']);
				assert.deepEqual(castArraySpy.args[2][0], ['baz', 'qux']);
			});
		});
	});
});
