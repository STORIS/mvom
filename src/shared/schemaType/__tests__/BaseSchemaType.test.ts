import type { MvRecord } from '#shared/types';
import BaseSchemaType from '../BaseSchemaType';

class TestSubclass extends BaseSchemaType {
	public get(): unknown {
		return 'foo';
	}

	public set(): MvRecord {
		return [];
	}

	public validate() {
		return Promise.resolve([]);
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
