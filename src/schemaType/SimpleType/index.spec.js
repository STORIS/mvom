/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import SimpleType from './';

describe('SimpleType', () => {
	describe('constructor', () => {
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new SimpleType());
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			let extension;
			const getFromMvData = stub();
			const transformFromDb = stub();
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
				extension.getFromMvData = getFromMvData;
				extension.transformFromDb = transformFromDb;
			});

			beforeEach(() => {
				getFromMvData.reset();
				transformFromDb.reset();
			});

			it('should return transformed data', () => {
				getFromMvData.returns('foo');
				transformFromDb.returns('bar');
				assert.strictEqual(extension.get(), 'bar');
			});
		});

		describe('getFromMvData', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			beforeEach(() => {
				extension._path = null;
			});

			it('should return null if path is null', () => {
				extension._path = null;
				assert.isNull(extension.getFromMvData());
			});

			it('should get value from shallow path', () => {
				extension._path = [0];
				const record = ['foo'];
				assert.strictEqual(extension.getFromMvData(record), 'foo');
			});

			it('should get value from one-level deep path', () => {
				extension._path = [0, 1];
				const record = [['foo', 'bar']];
				assert.strictEqual(extension.getFromMvData(record), 'bar');
			});

			it('should get value from one-level deep path not formatted as array', () => {
				extension._path = [0, 0];
				const record = ['foo'];
				assert.strictEqual(extension.getFromMvData(record), 'foo');
			});

			it('should get value from two-level deep path', () => {
				extension._path = [0, 1, 1];
				const record = [[['foo', 'bar'], ['baz', 'qux']]];
				assert.strictEqual(extension.getFromMvData(record), 'qux');
			});

			it('should get value from two-level deep path not formatted as deep array', () => {
				extension._path = [0, 1, 0];
				const record = [['foo', 'bar']];
				assert.strictEqual(extension.getFromMvData(record), 'bar');
			});

			it('should get value from two-level deep path not formatted as array', () => {
				extension._path = [0, 0, 0];
				const record = ['foo'];
				assert.strictEqual(extension.getFromMvData(record), 'foo');
			});
		});

		describe('set', () => {
			let extension;
			const setIntoMvData = stub();
			const transformToDb = stub();
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
				extension.setIntoMvData = setIntoMvData;
				extension.transformToDb = transformToDb;
			});

			beforeEach(() => {
				setIntoMvData.reset();
				transformToDb.reset();
			});

			it('should call transformToDb with passed parameter', () => {
				extension.set([], 'foo');
				assert.isTrue(transformToDb.calledWith('foo'));
			});

			it('should call setIntoMvData with passed parameter and result of transformToDb', () => {
				transformToDb.returns('qux');
				extension.set(['foo', 'bar'], 'baz');
				assert.deepEqual(setIntoMvData.args[0][0], ['foo', 'bar']);
				assert.strictEqual(setIntoMvData.args[0][1], 'qux');
			});

			it('should return result of setIntoMvData', () => {
				setIntoMvData.returns('foo');
				assert.strictEqual(extension.set([], ''), 'foo');
			});
		});

		describe('setIntoMvData', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should return unchanged array if instance _path is null', () => {
				extension._path = null;
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar']), ['foo', 'bar']);
			});

			it('should set the value at the array position specifed by the path', () => {
				extension._path = [2];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), ['foo', 'bar', 'baz']);
			});

			it('should set the value at the nested array position specifed by the path', () => {
				extension._path = [2, 1];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), [
					'foo',
					'bar',
					[undefined, 'baz'],
				]);
			});

			it('should set the value at the deeply nested array position specifed by the path', () => {
				extension._path = [2, 1, 1];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), [
					'foo',
					'bar',
					[undefined, [undefined, 'baz']],
				]);
			});
		});

		describe('_normalizeMvPath', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			beforeEach(() => {
				extension._path = 'testMe';
			});

			it('should set path to null if path is not provided', () => {
				extension._normalizeMvPath();
				assert.deepEqual(extension._path, null);
			});

			it('should throw an error if an integer-like string is not provided', () => {
				assert.throws(extension._normalizeMvPath.bind(extension, 'foo'));
			});

			it('should throw an error if an integer-like string is provided but is less than 1', () => {
				assert.throws(extension._normalizeMvPath.bind(extension, '0'));
			});

			it('should return an array of integers with a value one less than the parameter', () => {
				extension._normalizeMvPath('1');
				assert.deepEqual(extension._path, [0]);
			});

			it('should return an array of integers with a value one less than the parameter when a nested path is provided', () => {
				extension._normalizeMvPath('1.2');
				assert.deepEqual(extension._path, [0, 1]);
			});
		});
	});
});
