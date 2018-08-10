import { assert } from 'chai';
import getFromMvArray from './';

describe('getFromMvArray', () => {
	it('should return null if path is null', () => {
		assert.isNull(getFromMvArray([], null));
	});

	it('should return undefined if no record is passed', () => {
		assert.isUndefined(getFromMvArray(undefined, [0]));
	});

	it('should return undefined if root path position is null', () => {
		assert.isUndefined(getFromMvArray([null], [0, 0]));
	});

	it('should return undefined if path position is not present in array', () => {
		assert.isUndefined(getFromMvArray(['foo'], [0, 1]));
	});

	it('should get value from shallow path', () => {
		assert.strictEqual(getFromMvArray(['foo'], [0]), 'foo');
	});

	it('should get value from one-level deep path', () => {
		assert.strictEqual(getFromMvArray([['foo', 'bar']], [0, 1]), 'bar');
	});

	it('should get value from one-level deep path not formatted as array', () => {
		assert.strictEqual(getFromMvArray(['foo'], [0, 0]), 'foo');
	});

	it('should return undefined if nested path position is null', () => {
		assert.isUndefined(getFromMvArray([[null, null]], [0, 0, 0]));
	});

	it('should get value from two-level deep path', () => {
		assert.strictEqual(getFromMvArray([[['foo', 'bar'], ['baz', 'qux']]], [0, 1, 1]), 'qux');
	});

	it('should get value from two-level deep path not formatted as deep array', () => {
		assert.strictEqual(getFromMvArray([['foo', 'bar']], [0, 1, 0]), 'bar');
	});

	it('should get value from two-level deep path not formatted as array', () => {
		assert.strictEqual(getFromMvArray(['foo'], [0, 0, 0]), 'foo');
	});
});
