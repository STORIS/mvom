export interface DataTransformer {
	/** Transform from mv data to externally formatted data */
	transformFromDb(value: unknown): unknown;

	/** Transform from externally formatted data to mv data */
	transformToDb(value: unknown): string | null;

	/** Transform query constants to the format schema */
	transformToQuery(value: unknown): string;
}
