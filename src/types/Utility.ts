/** Mark some properties as required, leaving others unchanged */
export type MarkRequired<T, RK extends keyof T> = Omit<T, RK> & Required<Pick<T, RK>>;

/** Assert that two types are equal */
export type Assert<T, U> =
	(<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
		? true
		: { error: 'Types are not equal'; type1: T; type2: U };

/**
 * Helper type to deeply recurse an object and return a structure with the flattened keypath and type
 *
 * Scalar array types are returned as the scalar type (i.e. the array is dropped)
 *
 * The `D` and `DA` generics are used to limit the depth of recursion. See https://stackoverflow.com/a/76315151
 */
export type ToPaths<
	T,
	P extends string = '',
	D extends number = 9,
	DA extends unknown[] = [],
> = D extends DA['length']
	? unknown
	: T extends Record<string, unknown>
		? {
				[K in keyof T]: K extends string ? ToPaths<T[K], `${P}${K}.`, D, [0, ...DA]> : never;
			}[keyof T]
		: T extends (infer U)[]
			? ToPaths<U, P, D, [0, ...DA]>
			: { path: P extends `${infer Q}.` ? Q : never; type: T };

/** Convert output of `ToPaths` to an object type */
export type FromPaths<T extends { path: string; type: unknown }> = {
	[P in T['path']]: Extract<T, { path: P }>['type'];
};

/** Flatten an object to string keyPath (i.e. { "foo.bar.baz": number }) */
export type FlattenObject<TObject extends Record<string, unknown>> = FromPaths<ToPaths<TObject>>;
