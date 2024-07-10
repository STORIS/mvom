/*
 * The helpers in this file were extracted from https://github.com/DetachHead/ts-helpers/blob/master/src/types/misc.ts
 * which is licensed under the ISC license but doesn't have a license file in the repository.
 */

/**
 * "normalizes" types to be compared using {@link FunctionComparisonEquals}
 * - converts intersections of object types to normal object types
 *   (ie. converts `{foo: number} & {bar: number}` to `{foo: number, bar: number}`).
 *   see [this comment](https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650)
 * - removes empty object types (`{}`) from intersections (which [actually means any non-nullish
 *   value](https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492)) - see
 *   [this comment](https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-778623742)
 */
type FunctionComparisonEqualsWrapped<T> = T extends ( // eslint-disable-next-line @typescript-eslint/no-unused-vars -- https://github.com/typescript-eslint/typescript-eslint/issues/6253
	T extends NonNullish ? NonNullable<infer R> : infer R
)
	? {
			[P in keyof R]: R[P];
		}
	: never;

/**
 * compares two types using the technique described [here](https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-931205995)
 *
 * # benefits
 * - correctly handles `any`
 *
 * # drawbacks
 * - doesn't work properly with object types (see {@link FunctionComparisonEqualsWrapped}) and the fixes it applies don't work recursively
 */
type FunctionComparisonEquals<A, B> =
	(<T>() => T extends FunctionComparisonEqualsWrapped<A> ? 1 : 2) extends <
		T,
	>() => T extends FunctionComparisonEqualsWrapped<B> ? 1 : 2
		? true
		: { error: 'Types are not equal'; expected: A; actual: B };

/**
 * makes `T` invariant for use in conditional types
 * @example
 * type Foo = InvariantComparisonEqualsWrapped<string> extends InvariantComparisonEqualsWrapped<string | number> ? true : false //false
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention -- who asked
interface InvariantComparisonEqualsWrapped<in out _T> {}

/**
 * compares two types by creating invariant wrapper types for the `Expected` and `Actual` types, such that `extends`
 * in conditional types only return `true` if the types are equivalent
 * # benefits
 * - far less hacky than {@link FunctionComparisonEqualsWrapped}
 * - works properly with object types
 *
 * # drawbacks
 * - doesn't work properly with `any` (if the type itself is `any` it's handled correctly by a workaround here but not
 * if the type contains `any`)
 */
type InvariantComparisonEquals<Expected, Actual> =
	InvariantComparisonEqualsWrapped<Expected> extends InvariantComparisonEqualsWrapped<Actual>
		? IsAny<Expected | Actual> extends true
			? IsAny<Expected> extends true
				? true
				: { error: 'Types are not equal'; expected: Expected; actual: Actual }
			: true
		: { error: 'Types are not equal'; expected: Expected; actual: Actual };

/**
 * Checks if two types are equal at the type level.
 *
 * correctly checks `any` and `never`
 *
 * **WARNING:** there are several cases where this doesn't work properly, which is why i'm using two different methods to
 * compare the types. see [these issues](https://github.com/DetachHead/ts-helpers/labels/type%20testing)
 */
export type Equals<Expected, Actual> =
	InvariantComparisonEquals<Expected, Actual> extends true
		? FunctionComparisonEquals<Expected, Actual>
		: { error: 'Types are not equal'; expected: Expected; actual: Actual };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- checking for any type
type IsAny<T> = FunctionComparisonEquals<T, any>;

/**
 * any value that's not `null` or `undefined`
 *
 * useful when banning the `{}` type with `@typescript-eslint/ban-types`
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
 */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/consistent-type-definitions
type NonNullish = {};
