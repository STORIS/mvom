/** Mark some properties as required, leaving others unchanged */
export type MarkRequired<T, RK extends keyof T> = Omit<T, RK> & Required<Pick<T, RK>>;

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

/** Make composite types user friendly in the editor by constructing a new type with object keys */
export type Remap<T> = T extends infer O ? { [Key in keyof O]: O[Key] } : never;

/** Deeply mark all nullable properties as optional */
export type DeepOptionalNullable<TObject> = Remap<
	{
		[Key in keyof TObject as null extends TObject[Key] ? Key : never]?: TObject[Key];
	} & {
		[Key in keyof TObject as null extends TObject[Key] ? never : Key]: TObject[Key] extends Record<
			string,
			unknown
		>
			? DeepOptionalNullable<TObject[Key]>
			: TObject[Key] extends (infer U extends Record<string, unknown>)[]
				? DeepOptionalNullable<U>[]
				: TObject[Key];
	}
>;
