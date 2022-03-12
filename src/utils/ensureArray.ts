type EnsureArrayReturnType<T> = T extends undefined
	? never[]
	: T extends readonly (infer U)[]
	? U[]
	: T[];

const ensureArray = <T>(value?: T): EnsureArrayReturnType<T> => {
	// Unfortunately, TypeScript has a design limitation with respect to condition return types.  This has
	// been noted in several issues, such as this one: https://github.com/microsoft/TypeScript/issues/22735
	// Per a comment on that issue (https://github.com/microsoft/TypeScript/issues/22735#issuecomment-376960435) you
	// can use type assertion to avoid the type errors but still get the proper expecting typing in the caller
	if (Array.isArray(value)) {
		return [...value] as EnsureArrayReturnType<T>;
	}

	if (typeof value === 'undefined') {
		return [] as EnsureArrayReturnType<T>;
	}

	return [value] as EnsureArrayReturnType<T>;
};

export default ensureArray;
