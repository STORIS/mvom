import { mock } from 'jest-mock-extended';
import { BaseScalarType } from '..';
import type { DataTransformer, MvRecord } from '../../types';
import BaseScalarArrayType from '../BaseScalarArrayType';
import type { SchemaTypeDefinitionString } from '../StringType';

const dataTransformerMock = mock<DataTransformer>();

class TestScalarType extends BaseScalarType {
	protected dataTransformer = dataTransformerMock;

	public constructor(definition: SchemaTypeDefinitionString) {
		super(definition);
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
	test('should return empty array if input value is null', () => {
		const testSubclass = new TestSubclass(testScalarType);

		expect(testSubclass.cast(null)).toEqual([]);
	});

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
