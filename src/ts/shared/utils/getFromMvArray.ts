import { castArray } from 'lodash';

/**
 * Get data from a multivalue array at a given path
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFromMvArray = (record: any[] = [], path: number[]): any => {
	if (record[path[0]] == null || (path.length === 3 && record[path[0]][path[1]] == null)) {
		// if the entire contents of the record at the base path is null then we must treat this as a special case:
		// - returning undefined won't alter the behavior of simple data types (e.g. string, Boolean) since the undefined
		//   value will essentially get typecast back into null which is handled by all simple types.
		// - it is important to all "array" types that null be interpreted differently, however.  A null for a value intended
		//   to become an array needs to be treated as an empty array, which is different than an array of null.  Returning
		//   undefined here will allow the array types to detect this event and behave accordingly.
		return undefined;
	}

	// lodash.get will not work here because "array" data might be returned from multi-value that still
	// appears like a non-array; if that happens, lodash.get would return the character at that string position instead;
	// this reducer ensures that the appropriate value is retrieved.
	return path.reduce((acc, pathPart) => castArray(acc)[pathPart], record);
};

export default getFromMvArray;
