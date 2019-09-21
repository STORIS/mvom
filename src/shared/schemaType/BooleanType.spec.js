import BooleanType from './BooleanType';

describe('BooleanType', () => {
	describe('constructor', () => {
		test('should throw if a path is not provided in the definition', () => {
			expect(() => new BooleanType({})).toThrow();
		});

		test('should not throw if a path is provided in the definition', () => {
			expect(() => new BooleanType({ path: '1' })).not.toThrow();
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let booleanType;
			beforeAll(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			test('should return false when given a 0', () => {
				expect(booleanType.transformFromDb(0)).toBe(false);
			});

			test('should return false when given a string "0"', () => {
				expect(booleanType.transformFromDb('0')).toBe(false);
			});

			test('should return false when given null', () => {
				expect(booleanType.transformFromDb(null)).toBe(false);
			});

			test('should return true when given a 1', () => {
				expect(booleanType.transformFromDb(1)).toBe(true);
			});

			test('should return true when given any string', () => {
				expect(booleanType.transformFromDb('foo')).toBe(true);
			});
		});

		describe('transformToDb', () => {
			let booleanType;
			beforeAll(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			test('should return 1 if parameter is true', () => {
				expect(booleanType.transformToDb(true)).toBe('1');
			});

			test('should return 1 if parameter is truthy', () => {
				expect(booleanType.transformToDb('foo')).toBe('1');
			});

			test('should return 0 if parameter is false', () => {
				expect(booleanType.transformToDb(false)).toBe('0');
			});

			test('should return 0 if parameter is falsy', () => {
				expect(booleanType.transformToDb(0)).toBe('0');
			});
		});

		describe('transformToQuery', () => {
			let booleanType;
			beforeAll(() => {
				booleanType = new BooleanType({ path: '1' });
			});

			describe('truthy', () => {
				test('should return 1 for Boolean true', () => {
					expect(booleanType.transformToQuery(true)).toBe('1');
				});

				test('should return 1 for string true', () => {
					expect(booleanType.transformToQuery('true')).toBe('1');
				});

				test('should return 1 for string TRUE', () => {
					expect(booleanType.transformToQuery('TRUE')).toBe('1');
				});
			});

			describe('falsy', () => {
				test('should return 0 for Boolean false', () => {
					expect(booleanType.transformToQuery(false)).toBe('0');
				});

				test('should return 0 for string false', () => {
					expect(booleanType.transformToQuery('false')).toBe('0');
				});

				test('should return 0 for string FALSE', () => {
					expect(booleanType.transformToQuery('FALSE')).toBe('0');
				});
			});

			describe('other', () => {
				test('should return the passed value', () => {
					expect(booleanType.transformToQuery('foo')).toBe('foo');
				});
			});
		});
	});
});
