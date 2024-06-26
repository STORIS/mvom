import type { MvRecord } from '../../types';
import BaseSchemaType from '../BaseSchemaType';

class TestSubclass extends BaseSchemaType {
	public get(): unknown {
		return 'foo';
	}

	public set(): MvRecord {
		return [];
	}

	public validate() {
		return [];
	}
}

const testSubclass = new TestSubclass();

describe('transformForeignKeyDefinitionsToDb', () => {
	test('should return empty array', () => {
		expect(testSubclass.transformForeignKeyDefinitionsToDb('foo')).toEqual([]);
	});
});

describe('cast', () => {
	test('should return input parameter value', () => {
		expect(testSubclass.cast('foo')).toBe('foo');
	});
});

describe('getFromMvArray', () => {
	test('should return undefined if no record is passed', () => {
		expect(testSubclass.getFromMvArray([0], undefined)).toBeUndefined();
	});

	test('should return undefined if root path position is null', () => {
		expect(testSubclass.getFromMvArray([0, 0], [null])).toBeUndefined();
	});

	test('should return undefined if path position is not present in array', () => {
		expect(testSubclass.getFromMvArray([0, 1], ['foo'])).toBeUndefined();
	});

	test('should get value from shallow path', () => {
		expect(testSubclass.getFromMvArray([0], ['foo'])).toBe('foo');
	});

	test('should get value from one-level deep path', () => {
		expect(testSubclass.getFromMvArray([0, 1], [['foo', 'bar']])).toBe('bar');
	});

	test('should get value from one-level deep path not formatted as array', () => {
		expect(testSubclass.getFromMvArray([0, 0], ['foo'])).toBe('foo');
	});

	test('should return undefined if nested path position is null', () => {
		expect(testSubclass.getFromMvArray([0, 0, 0], [[null, null]])).toBeUndefined();
	});

	test('should get value from two-level deep path', () => {
		expect(
			testSubclass.getFromMvArray(
				[0, 1, 1],
				[
					[
						['foo', 'bar'],
						['baz', 'qux'],
					],
				],
			),
		).toBe('qux');
	});

	test('should get value from two-level deep path not formatted as deep array', () => {
		expect(testSubclass.getFromMvArray([0, 1, 0], [['foo', 'bar']])).toBe('bar');
	});

	test('should get value from two-level deep path not formatted as array', () => {
		expect(testSubclass.getFromMvArray([0, 0, 0], ['foo'])).toBe('foo');
	});
});
