/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import Schema from './';

describe('Schema', () => {
	describe('isDataDefinition', () => {
		it('should return false', () => {
			assert.isFalse(Schema.isDataDefinition('foo'));
		});

		it('should return true', () => {
			assert.isTrue(Schema.isDataDefinition({ path: 'foo' }));
		});
	});

	describe('normalizeMvPath', () => {
		it('should throw an error if an integer-like string is not provided', () => {
			assert.throws(Schema.normalizeMvPath.bind(Schema, 'foo'));
		});

		it('should throw an error if an integer-like string is provided but is less than 1', () => {
			assert.throws(Schema.normalizeMvPath.bind(Schema, '0'));
		});

		it('should return an array of integers with a value one less than the parameter', () => {
			assert.deepEqual(Schema.normalizeMvPath('1'), [0]);
		});

		it('should return an array of integers with a value one less than the parameter when a nested path is provided', () => {
			assert.deepEqual(Schema.normalizeMvPath('1.2'), [0, 1]);
		});
	});

	describe('constructor', () => {
		before(() => {
			stub(Schema, 'isDataDefinition').returns(true);
			stub(Schema, 'normalizeMvPath').returns(['pathFoo']);
		});

		after(() => {
			Schema.isDataDefinition.restore();
			Schema.normalizeMvPath.restore();
		});

		it('should set instance variables when constructing', () => {
			const schema = new Schema({ foo: { path: '1' } });
			assert.deepEqual(schema.definition, { foo: { path: ['pathFoo'] } });
		});
	});

	describe('_buildPaths', () => {
		const schema = new Schema({ foo: { path: '1' } });
		let isDataDefinition;
		before(() => {
			isDataDefinition = stub(Schema, 'isDataDefinition').returns(true);
			stub(Schema, 'normalizeMvPath').returns(['pathFoo']);
		});

		beforeEach(() => {
			schema.paths = {}; // clear it out before each test
			isDataDefinition.reset();
		});

		after(() => {
			isDataDefinition.restore();
			Schema.normalizeMvPath.restore();
		});

		it('should throw an error if array length is greater than 1', () => {
			schema.definition = { foo: [{ path: '1' }, { path: '2' }] };
			assert.throws(schema._buildPaths);
		});

		it('should throw an error if array does not contain a language object', () => {
			schema.definition = { foo: ['bar'] };
			assert.throws(schema._buildPaths);
		});

		it('should throw an error if array of arrays does not contain a data definition', () => {
			isDataDefinition.returns(false);
			schema.definition = { foo: [['bar']] };
			assert.throws(schema._buildPaths);
		});

		it('should set paths for an array of arrays containing data definitions', () => {
			isDataDefinition.returns(true);
			schema.definition = { foo: [[{ path: '1' }]] };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { foo: [[{ path: ['pathFoo'] }]] });
		});

		it('should set paths for an array containing data definitions', () => {
			isDataDefinition.returns(true);
			schema.definition = { foo: [{ path: '1' }] };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { foo: [{ path: ['pathFoo'] }] });
		});

		it('should set paths to the previously built array of Schema', () => {
			isDataDefinition.returns(true);
			const nestedSchema = new Schema({ bar: { path: '1' } });
			schema.definition = { foo: [nestedSchema] };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { foo: [nestedSchema] });
		});

		it('should return an array of newly compiled schema', () => {
			isDataDefinition.onCall(0).returns(false);
			isDataDefinition.onCall(1).returns(true);
			schema.definition = { foo: [{ bar: { path: '1' } }] };
			schema._buildPaths();
			assert.instanceOf(schema.paths.foo[0], Schema);
			assert.deepEqual(schema.paths.foo[0].paths, { bar: { path: ['pathFoo'] } });
		});

		it('should set paths to the previously built Schema', () => {
			isDataDefinition.returns(true);
			const nestedSchema = new Schema({ bar: { path: '1' } });
			schema.definition = { foo: nestedSchema };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { foo: nestedSchema });
		});

		it('should set paths to the passed definition', () => {
			isDataDefinition.returns(true);
			schema.definition = { foo: { path: '1' } };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { foo: { path: ['pathFoo'] } });
		});

		it('should recusively process nested objects', () => {
			isDataDefinition.onCall(0).returns(false);
			isDataDefinition.onCall(1).returns(true);
			schema.definition = { foo: { bar: { path: '1' } } };
			schema._buildPaths();
			assert.deepEqual(schema.paths, { 'foo.bar': { path: ['pathFoo'] } });
		});

		it('should throw an error if the schema definition is invalid', () => {
			schema.definition = 'foo';
			assert.throws(schema._buildPaths);
		});
	});
});
