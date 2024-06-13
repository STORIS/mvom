/** Mark some properties as required, leaving others unchanged */
export type MarkRequired<T, RK extends keyof T> = Omit<T, RK> & Required<Pick<T, RK>>;

/** Assert that two types are equal */
export type Assert<T, U> =
	(<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
		? true
		: { error: 'Types are not equal'; type1: T; type2: U };
