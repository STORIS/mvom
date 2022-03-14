import BaseDateType from '../BaseDateType';
import type { SchemaTypeDefinitionISOCalendarDate } from '../ISOCalendarDateType';

class TestSubclass extends BaseDateType {
	public constructor(definition: SchemaTypeDefinitionISOCalendarDate) {
		super(definition);
	}

	public transformFromDb(value: unknown): unknown {
		return value;
	}

	public transformToDb(value: unknown): string | null {
		return String(value);
	}
}

describe('transformToQuery', () => {
	test('should transform empty string to empty string', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		expect(testSubclass.transformToQuery('')).toBe('');
	});

	test('should transform null to empty string', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		expect(testSubclass.transformToQuery(null)).toBe('');
	});

	test('should transform all others using transformToDb method', () => {
		const definition: SchemaTypeDefinitionISOCalendarDate = {
			type: 'ISOCalendarDate',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		expect(testSubclass.transformToQuery('foo')).toBe('foo');
	});
});
