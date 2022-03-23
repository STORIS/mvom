import BooleanDataTransformer from '../BooleanDataTransformer';

describe('transformFromDb', () => {
	const booleanDataTransformer = new BooleanDataTransformer();

	test('should transform null to false', () => {
		expect(booleanDataTransformer.transformFromDb(null)).toBe(false);
	});

	test('should transform string 0 to false', () => {
		expect(booleanDataTransformer.transformFromDb('0')).toBe(false);
	});

	test('should transform 0 to false', () => {
		expect(booleanDataTransformer.transformFromDb(0)).toBe(false);
	});

	test('should transform 1 to true', () => {
		expect(booleanDataTransformer.transformFromDb(1)).toBe(true);
	});

	test('should transform truthy value to true', () => {
		expect(booleanDataTransformer.transformFromDb('foo')).toBe(true);
	});
});

describe('transformToDb', () => {
	const booleanDataTransformer = new BooleanDataTransformer();

	test('should transform boolean true to 1', () => {
		expect(booleanDataTransformer.transformToDb(true)).toBe('1');
	});

	test('should transform boolean false to 0', () => {
		expect(booleanDataTransformer.transformToDb(false)).toBe('0');
	});

	test('should transform truthy value to 1', () => {
		expect(booleanDataTransformer.transformToDb('truthy')).toBe('1');
	});

	test('should transform falsy value to 0', () => {
		expect(booleanDataTransformer.transformToDb('')).toBe('0');
	});
});

describe('transformToQuery', () => {
	const booleanDataTransformer = new BooleanDataTransformer();

	test('should transform boolean true to 1', () => {
		expect(booleanDataTransformer.transformToQuery(true)).toBe('1');
	});

	test('should transform string true to 1', () => {
		expect(booleanDataTransformer.transformToQuery('true')).toBe('1');
	});

	test('should transform string TRUE to 1', () => {
		expect(booleanDataTransformer.transformToQuery('TRUE')).toBe('1');
	});

	test('should transform boolean false to 0', () => {
		expect(booleanDataTransformer.transformToQuery(false)).toBe('0');
	});

	test('should transform string false to 0', () => {
		expect(booleanDataTransformer.transformToQuery('false')).toBe('0');
	});

	test('should transform string FALSE to 0', () => {
		expect(booleanDataTransformer.transformToQuery('FALSE')).toBe('0');
	});

	test('should not transform other values', () => {
		expect(booleanDataTransformer.transformToQuery('foo')).toBe('foo');
	});
});
