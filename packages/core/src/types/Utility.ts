/** Mark some properties as required, leaving others unchanged */
export type MarkRequired<T, RK extends keyof T> = Omit<T, RK> & Required<Pick<T, RK>>;
