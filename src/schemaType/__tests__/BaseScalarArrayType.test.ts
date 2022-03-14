import { BaseScalarType } from '..';
import type { MvRecord } from '../../types';
import BaseScalarArrayType from '../BaseScalarArrayType';
import type { SchemaTypeDefinitionString } from '../StringType';

const transformToQueryMock = jest.fn();

class TestScalarType extends BaseScalarType {
	public constructor(definition: SchemaTypeDefinitionString) {
		super(definition);
	}

	public override transformToQuery(value: unknown): unknown {
		return transformToQueryMock(value);
	}

	public transformFromDb(value: unknown): unknown {
		return value;
	}

	public transformToDb(value: unknown): string | null {
		return String(value);
	}
}

const definition: SchemaTypeDefinitionString = {
	type: 'string',
	path: '2',
};

const testScalarType = new TestScalarType(definition);

class TestSubclass extends BaseScalarArrayType {
	public constructor(valueSchemaType: BaseScalarType) {
		super(valueSchemaType);
	}

	public get(record: MvRecord) {
		return record;
	}

	public set(record: MvRecord) {
		return record;
	}

	public transformFromDb(value: unknown): unknown {
		return value;
	}

	public transformToDb(value: unknown): unknown {
		return value;
	}

	public validate(): Promise<string[]> {
		return Promise.resolve([]);
	}
}

describe('cast', () => {
	test('should cast scalar value to array', () => {
		const testSubclass = new TestSubclass(testScalarType);

		expect(testSubclass.cast('foo')).toEqual(['foo']);
	});

	test('should return original array unchanged', () => {
		const testSubclass = new TestSubclass(testScalarType);

		const value = ['foo'];
		expect(testSubclass.cast(value)).toEqual(value);
	});
});

describe('transformToQuery', () => {
	beforeEach(() => {
		transformToQueryMock.mockImplementation(() => 'transformed');
	});

	test('should delegate transformation of query value to value schemaType', () => {
		const testSubclass = new TestSubclass(testScalarType);

		expect(testSubclass.transformToQuery('foo')).toBe('transformed');
		expect(transformToQueryMock).toHaveBeenCalledWith('foo');
	});
});
