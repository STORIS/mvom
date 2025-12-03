import ensureArray from '../ensureArray';

test('should return an array if passed an array', () => {
	expect(ensureArray(['foo', 'bar'])).toEqual(['foo', 'bar']);
});

test('should return the same array reference when passed an array', () => {
	const input = ['foo', 'bar'];
	expect(ensureArray(input)).toBe(input); // referential equality
});

test('should return an empty array if no value passed', () => {
	expect(ensureArray()).toEqual([]);
});

test('should return an empty array if undefined value passed', () => {
	expect(ensureArray(undefined)).toEqual([]);
});

test('should return an array of the parameter if a non-array value is passed', () => {
	expect(ensureArray('foo')).toEqual(['foo']);
});
