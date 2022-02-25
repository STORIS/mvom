import type { ForeignKeyDbDefinition } from '#shared/classes/ForeignKeyDbTransformer';
import type { GenericObject } from '#shared/types';
import { ensureArray } from '#shared/utils';
import BaseScalarArrayType from './BaseScalarArrayType';

const ISVALID_SYMBOL = Symbol('Is Valid');

/** Nested Scalar Array Schema Type */
class NestedArrayType extends BaseScalarArrayType {
	/** Get value from mv data */
	public get = (record: unknown[]): unknown[][] => {
		const value = this.valueSchemaType.getFromMvData(record);

		return ensureArray(value).map((itemValue) =>
			ensureArray(itemValue).map((nestedValue) =>
				this.valueSchemaType.transformFromDb(nestedValue),
			),
		);
	};

	/** Set specified nested array value into mv record */
	public set = (originalRecord: unknown[], setValue: unknown): unknown[] =>
		this.valueSchemaType.setIntoMvData(
			originalRecord,
			ensureArray(setValue).map((value) =>
				ensureArray(value).map((nestedValue) => this.valueSchemaType.transformToDb(nestedValue)),
			),
		);

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb = (value: unknown): ForeignKeyDbDefinition[] =>
		ensureArray(value)
			.flat(Infinity)
			.map((nestedValue) => this.valueSchemaType.transformForeignKeyDefinitionsToDb(nestedValue))
			.flat();

	/** Validate the nested array */
	public validate = async (value: unknown, document: GenericObject): Promise<string[]> => {
		const castValue = ensureArray(value);

		// combining all the validation into one array of promise.all
		// - validation against the values in the array will return an array of 0 to n errors for each value
		//   the array values were flattened prior to validation to easily validate each value
		// - the validators against the entire array will return a placeholder symbol or the appropriate error message
		// - flatten the results of all validators to ensure an array only 1-level deep
		// - filter out the placeholder symbols to only return the error messages

		return (
			await Promise.all([
				Promise.all(
					this.validators.map(async ({ validator, message }) => {
						const isValid = await validator(castValue, document);
						return isValid ? ISVALID_SYMBOL : message;
					}),
				),
				Promise.all(
					castValue
						.flat()
						.map(async (arrayItem) => this.valueSchemaType.validate(arrayItem, document)),
				),
			])
		)
			.flat(2)
			.filter((val): val is string => val !== ISVALID_SYMBOL);
	};
}

export default NestedArrayType;
