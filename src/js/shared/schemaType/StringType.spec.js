import { stub } from 'sinon';
import StringType, { __RewireAPI__ as RewireAPI } from './StringType';

describe('StringType', () => {
	class InvalidParameterError extends Error {}

	class ForeignKeyDbTransformer {
		transform = stub().returns(['foreignKeyDefinitions']);
	}

	beforeAll(() => {
		RewireAPI.__Rewire__('ForeignKeyDbTransformer', ForeignKeyDbTransformer);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
	});

	afterAll(() => {
		__rewire_reset_all__();
	});

	describe('constructor', () => {
		test('should throw InvalidParameterError if a path is not provided in the definition', () => {
			expect(() => new StringType({})).toThrow();
		});

		test('should not throw if a path is provided in the definition', () => {
			expect(() => new StringType({ path: '1' })).not.toThrow();
		});

		test('should throw InvalidParameterError if enum is provided and is not an array', () => {
			expect(() => new StringType({ path: '1', enum: 'foo' })).toThrow();
		});

		test('should not throw if enum is provided and is an array', () => {
			expect(() => new StringType({ path: '1', enum: ['foo'] })).not.toThrow();
		});

		test('should set _enum to the passed enum value', () => {
			const enumVal = ['foo'];
			const stringType = new StringType({ path: '1', enum: enumVal });
			expect(stringType._enum).toEqual(enumVal);
		});

		test('should set _enum to null if it is not provided', () => {
			const stringType = new StringType({ path: '1' });
			expect(stringType._enum).toBeNull();
		});

		test('should throw InvalidParameterError if match is provided and is not a regular expression', () => {
			expect(() => new StringType({ path: '1', match: 'foo' })).toThrow();
		});

		test('should set _match to the passed match value', () => {
			const matchVal = /\w+\*+\w/;
			const stringType = new StringType({ path: '1', match: matchVal });
			expect(stringType._match).toEqual(matchVal);
		});

		test('should set _match to null if it is not provided', () => {
			const stringType = new StringType({ path: '1' });
			expect(stringType._match).toBeNull();
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			describe('no enum', () => {
				let stringType;
				beforeAll(() => {
					stringType = new StringType({ path: '1' });
				});

				test('should return null if value is not provided', () => {
					expect(stringType.transformFromDb()).toBeNull();
				});

				test('should return passed string value', () => {
					expect(stringType.transformFromDb('foo')).toBe('foo');
				});

				test('should return cast string value', () => {
					expect(stringType.transformFromDb(1337)).toBe('1337');
				});
			});

			describe('enum', () => {
				test('should return empty string if enum contains empty string', () => {
					const stringType = new StringType({ path: '1', enum: ['', 'foo', 'bar'] });
					expect(stringType.transformFromDb(null)).toBe('');
				});

				test('should return null if enum does not contain empty string', () => {
					const stringType = new StringType({ path: '1', enum: ['foo', 'bar'] });
					expect(stringType.transformFromDb(null)).toBeNull();
				});
			});
		});

		describe('transformToDb', () => {
			let stringType;
			beforeAll(() => {
				stringType = new StringType({ path: '1' });
			});

			test('should return a string without alteration', () => {
				expect(stringType.transformToDb('foo')).toBe('foo');
			});

			test('should return null if null passed', () => {
				expect(stringType.transformToDb(null)).toBeNull();
			});

			test('should typecast if a non-string is passed', () => {
				expect(stringType.transformToDb(1234)).toBe('1234');
			});
		});

		describe('transformForeignKeyDefinitionsToDb', () => {
			let stringType;
			beforeAll(() => {
				stringType = new StringType({ path: '1' });
			});

			test('should return the foreign key definitions', () => {
				expect(stringType.transformForeignKeyDefinitionsToDb('foo')).toEqual([
					'foreignKeyDefinitions',
				]);
			});
		});

		describe('_validateEnum', () => {
			test('should skip enum validation and return true if value is null even if an enum property is provided', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				expect(await stringType._validateEnum(null)).toBe(true);
			});

			test('should return true if no enum property was provided', async () => {
				const stringType = new StringType({ path: '1' });
				expect(await stringType._validateEnum('foo')).toBe(true);
			});

			test('should return true if value is in the provided enum list', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				expect(await stringType._validateEnum('foo')).toBe(true);
			});

			test('should return false if value is not in the provided enum list', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				expect(await stringType._validateEnum('bar')).toBe(false);
			});
		});

		describe('_validateMatch', () => {
			test('should skip match validation and return true if value is null even if a match property is provided', async () => {
				const stringType = new StringType({ path: '1', match: /\w+\*+\w/ });
				expect(await stringType._validateMatch(null)).toBe(true);
			});

			test('should return true if no match property was provided', async () => {
				const stringType = new StringType({ path: '1' });
				expect(await stringType._validateMatch('foo')).toBe(true);
			});

			test('should return true if value matches the match regular expression', async () => {
				const stringType = new StringType({ path: '1', match: /\w+\*+\w/ });
				expect(await stringType._validateMatch('foo*bar')).toBe(true);
			});

			test('should return false if value does not match the match regular expression', async () => {
				const stringType = new StringType({ path: '1', match: /\w+\*+\w/ });
				expect(await stringType._validateMatch('foo*')).toBe(false);
			});
		});

		describe('_validateRequired', () => {
			let stringType;
			beforeAll(() => {
				stringType = new StringType({ path: '1' });
			});

			test('should resolve as false if value is undefined', async () => {
				expect(await stringType._validateRequired()).toBe(false);
			});

			test('should resolve as false if value is null', async () => {
				expect(await stringType._validateRequired(null)).toBe(false);
			});

			test('should resolve as false if value is empty string', async () => {
				expect(await stringType._validateRequired('')).toBe(false);
			});

			test('should resolve as true if value is anything else', async () => {
				expect(await stringType._validateRequired('foo')).toBe(true);
			});
		});
	});
});
