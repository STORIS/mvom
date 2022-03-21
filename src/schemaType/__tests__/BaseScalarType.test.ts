import { mock } from 'jest-mock-extended';
import type { SchemaTypeDefinitionScalar } from '..';
import type Document from '../../Document';
import { InvalidParameterError } from '../../errors';
import type { MvRecord } from '../../types';
import type { ScalarTypeConstructorOptions } from '../BaseScalarType';
import BaseScalarType from '../BaseScalarType';
import type { SchemaTypeDefinitionString } from '../StringType';

const documentMock = mock<Document>();

class TestSubclass extends BaseScalarType {
	public constructor(
		definition: SchemaTypeDefinitionScalar,
		options?: ScalarTypeConstructorOptions,
	) {
		super(definition, options);
	}

	public transformFromDb(value: unknown): unknown {
		return value;
	}

	public transformToDb(value: unknown): string | null {
		return String(value);
	}

	public transformToQuery(value: unknown): string {
		return String(value);
	}
}

describe('constructor', () => {
	describe('encryption validation', () => {
		test('should throw InvalidParameterError if encrypted flag is set but encrypt function is not provided', () => {
			const decrypt = jest.fn();

			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				encrypted: true,
			};

			expect(() => {
				new TestSubclass(definition, { decrypt });
			}).toThrow(InvalidParameterError);
		});

		test('should throw InvalidParameterError if encrypted flag is set but decrypt function is not provided', () => {
			const encrypt = jest.fn();

			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
				encrypted: true,
			};

			expect(() => {
				new TestSubclass(definition, { encrypt });
			}).toThrow(InvalidParameterError);
		});
	});

	describe('path validation', () => {
		test('should not throw if path is a properly formatted string', () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2',
			};

			expect(() => {
				new TestSubclass(definition);
			}).not.toThrow();
		});

		test('should not throw if path is a number', () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: 2,
			};

			expect(() => {
				new TestSubclass(definition);
			}).not.toThrow();
		});

		test('should throw InvalidParameterError if path string includes a 0', () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: '2.0',
			};

			expect(() => {
				new TestSubclass(definition);
			}).toThrow(InvalidParameterError);
		});

		test('should throw InvalidParameterError if path number is 0', () => {
			const definition: SchemaTypeDefinitionString = {
				type: 'string',
				path: 0,
			};

			expect(() => {
				new TestSubclass(definition);
			}).toThrow(InvalidParameterError);
		});
	});
});

describe('get', () => {
	test('should get data from attribute based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', 'bar'];

		expect(testSubclass.get(record)).toBe('bar');
	});

	test('should get data from value based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', ['bar', 'baz']];

		expect(testSubclass.get(record)).toBe('baz');
	});

	test('should get data from subvalue based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', ['bar', ['baz', 'qux']]];

		expect(testSubclass.get(record)).toBe('qux');
	});
});

describe('set', () => {
	test('should set data using attribute based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.set(record, 'foo')).toEqual([undefined, 'foo']);
	});

	test('should set data using value based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.set(record, 'foo')).toEqual([undefined, [undefined, 'foo']]);
	});

	test('should set data using subvalue based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.set(record, 'foo')).toEqual([undefined, [undefined, [undefined, 'foo']]]);
	});
});

describe('transformToQuery', () => {
	test('should return the parameter input value', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		expect(testSubclass.transformToQuery('foo')).toBe('foo');
	});
});

describe('validate', () => {
	test('should return error message if required is true and value is null', async () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			required: true,
		};

		const testSubclass = new TestSubclass(definition);

		const value = null;

		expect(await testSubclass.validate(value, documentMock)).toContain('Property is required');
	});

	test('should not return error message if required is true and value is populated', async () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			required: true,
		};

		const testSubclass = new TestSubclass(definition);

		const value = 'foo';

		expect(await testSubclass.validate(value, documentMock)).not.toContain('Property is required');
	});

	test('should not return error message if required is false and value is null', async () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			required: false,
		};

		const testSubclass = new TestSubclass(definition);

		const value = null;

		expect(await testSubclass.validate(value, documentMock)).not.toContain('Property is required');
	});
});

describe('getFromMvData', () => {
	test('should get data from attribute based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', 'bar'];

		expect(testSubclass.getFromMvData(record)).toBe('bar');
	});

	test('should get data from value based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', ['bar', 'baz']];

		expect(testSubclass.getFromMvData(record)).toBe('baz');
	});

	test('should get data from subvalue based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = ['foo', ['bar', ['baz', 'qux']]];

		expect(testSubclass.getFromMvData(record)).toBe('qux');
	});

	test('should get and decrypt data if encryption functionality is specified', () => {
		const encrypt = jest.fn().mockReturnValue('encrypted');
		const decrypt = jest.fn().mockReturnValue('decrypted');

		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			encrypted: true,
		};
		const testSubclass = new TestSubclass(definition, { encrypt, decrypt });

		const record: MvRecord = ['foo', 'bar'];

		expect(testSubclass.getFromMvData(record)).toBe('decrypted');
		expect(decrypt).toHaveBeenCalledWith('bar');
	});
});

describe('setIntoMvData', () => {
	test('should set data using attribute based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.setIntoMvData(record, 'foo')).toEqual([undefined, 'foo']);
	});

	test('should set data using value based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.setIntoMvData(record, 'foo')).toEqual([undefined, [undefined, 'foo']]);
	});

	test('should set data using subvalue based path', () => {
		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2.2.2',
		};
		const testSubclass = new TestSubclass(definition);

		const record: MvRecord = [];

		expect(testSubclass.setIntoMvData(record, 'foo')).toEqual([
			undefined,
			[undefined, [undefined, 'foo']],
		]);
	});

	test('should encrypt and set data if encryption functionality is specified', () => {
		const encrypt = jest.fn().mockReturnValue('encrypted');
		const decrypt = jest.fn().mockReturnValue('decrypted');

		const definition: SchemaTypeDefinitionString = {
			type: 'string',
			path: '2',
			encrypted: true,
		};
		const testSubclass = new TestSubclass(definition, { encrypt, decrypt });

		const record: MvRecord = [];

		expect(testSubclass.setIntoMvData(record, 'foo')).toEqual([undefined, 'encrypted']);
		expect(encrypt).toHaveBeenCalledWith('foo');
	});
});
