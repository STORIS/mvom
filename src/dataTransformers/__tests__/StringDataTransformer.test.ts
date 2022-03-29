import StringDataTransformer from '../StringDataTransformer';

describe('transformFromDb', () => {
	test('should return null if value is null and no enum is defined', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should return null if value is null, enum is defined, but empty string is not in enum', () => {
		const stringDataTransformer = new StringDataTransformer(['foo', 'bar']);

		expect(stringDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should return empty string if value is null, enum is defined, and enum contains empty string', () => {
		const stringDataTransformer = new StringDataTransformer(['', 'foo', 'bar']);

		expect(stringDataTransformer.transformFromDb(null)).toBe('');
	});

	test('should cast non-strings to strings', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformFromDb(1234)).toBe('1234');
	});

	test('should return strings unchanged', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformFromDb('foo')).toBe('foo');
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformToDb(null)).toBeNull();
	});

	test('should return value cast to string if non-string', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformToDb(1234)).toBe('1234');
	});

	test('should return strings unchanged', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformToDb('foo')).toBe('foo');
	});
});

describe('transformToQuery', () => {
	test('should return a string representation of value input', () => {
		const stringDataTransformer = new StringDataTransformer();

		expect(stringDataTransformer.transformToQuery(1234)).toBe('1234');
	});
});
