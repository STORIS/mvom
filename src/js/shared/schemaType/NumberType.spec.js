import NumberType from './NumberType';

describe('NumberType', () => {
	describe('constructor', () => {
		test('should throw if a path is not provided in the definition', () => {
			expect(() => new NumberType({})).toThrow();
		});

		test('should throw if dbDecimals is a non-integer decimal', () => {
			expect(() => new NumberType({ path: '1', dbDecimals: 1.1 })).toThrow();
		});

		test('should throw if dbDecimals is a non-integer string', () => {
			expect(() => new NumberType({ path: '1', dbDecimals: 'foo' })).toThrow();
		});

		test('should not throw if a path is provided in the definition', () => {
			expect(() => new NumberType({ path: '1' })).not.toThrow();
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let numberType;
			beforeAll(() => {
				numberType = new NumberType({ path: '1' });
			});

			beforeEach(() => {
				numberType._dbDecimals = 0;
			});

			test('should throw if value is not a number', () => {
				expect(numberType.transformFromDb.bind(numberType, 'foo')).toThrow();
			});

			test("should return null if the input value isn't provided", () => {
				expect(numberType.transformFromDb()).toBeNull();
			});

			test('should return the same as input value if dbDecimals is 0', () => {
				numberType._dbDecimals = 0;
				expect(numberType.transformFromDb(12345)).toBe(12345);
			});

			test('should shift the decimal to the left 1 place if dbDecimals is 1', () => {
				numberType._dbDecimals = 1;
				expect(numberType.transformFromDb(12345)).toBe(1234.5);
			});

			test('should shift the decimal to the left 2 places if dbDecimals is 2', () => {
				numberType._dbDecimals = 2;
				expect(numberType.transformFromDb(12345)).toBe(123.45);
			});

			test('should round and truncate any decimals present in the original data', () => {
				numberType._dbDecimals = 2;
				expect(numberType.transformFromDb(12345.6)).toBe(123.46);
			});
		});

		describe('transformToDb', () => {
			let numberType;
			beforeAll(() => {
				numberType = new NumberType({ path: '1' });
			});

			beforeEach(() => {
				numberType._dbDecimals = 0;
			});

			test('should return null if null passed to function', () => {
				expect(numberType.transformToDb(null)).toBeNull();
			});

			test('should shift the decimal to the right 2 places if dbDecimals is 2', () => {
				numberType._dbDecimals = 2;
				expect(numberType.transformToDb(123.45)).toBe('12345');
			});

			test('should round and truncate any decimals present in the original data', () => {
				numberType._dbDecimals = 2;
				expect(numberType.transformToDb(123.456)).toBe('12346');
			});
		});

		describe('_validateType', () => {
			let numberType;
			beforeAll(() => {
				numberType = new NumberType({ path: '1' });
			});

			test('should resolve as true if value is undefined', async () => {
				expect(await numberType._validateType()).toBe(true);
			});

			test('should resolve as true if value is null', async () => {
				expect(await numberType._validateType(null)).toBe(true);
			});

			test('should resolve as true if value is a finite number', async () => {
				expect(await numberType._validateType(1337)).toBe(true);
			});

			test('should resolve as true if value can be cast to a finite number', async () => {
				expect(await numberType._validateType('1337')).toBe(true);
			});

			test('should resolve as false if value cannot be cast to a finite number', async () => {
				expect(await numberType._validateType('foo')).toBe(false);
			});

			test('should resolve as false if value is numeric but not a finite number', async () => {
				expect(await numberType._validateType(NaN)).toBe(false);
			});
		});
	});
});
