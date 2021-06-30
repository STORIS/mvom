import getFromMvArray from './getFromMvArray';

test('should return undefined if no record is passed', () => {
	expect(getFromMvArray(undefined, [0])).toBeUndefined();
});

test('should return undefined if root path position is null', () => {
	expect(getFromMvArray([null], [0, 0])).toBeUndefined();
});

test('should return undefined if path position is not present in array', () => {
	expect(getFromMvArray(['foo'], [0, 1])).toBeUndefined();
});

test('should get value from shallow path', () => {
	expect(getFromMvArray(['foo'], [0])).toBe('foo');
});

test('should get value from one-level deep path', () => {
	expect(getFromMvArray([['foo', 'bar']], [0, 1])).toBe('bar');
});

test('should get value from one-level deep path not formatted as array', () => {
	expect(getFromMvArray(['foo'], [0, 0])).toBe('foo');
});

test('should return undefined if nested path position is null', () => {
	expect(getFromMvArray([[null, null]], [0, 0, 0])).toBeUndefined();
});

test('should get value from two-level deep path', () => {
	expect(
		getFromMvArray(
			[
				[
					['foo', 'bar'],
					['baz', 'qux'],
				],
			],
			[0, 1, 1],
		),
	).toBe('qux');
});

test('should get value from two-level deep path not formatted as deep array', () => {
	expect(getFromMvArray([['foo', 'bar']], [0, 1, 0])).toBe('bar');
});

test('should get value from two-level deep path not formatted as array', () => {
	expect(getFromMvArray(['foo'], [0, 0, 0])).toBe('foo');
});
