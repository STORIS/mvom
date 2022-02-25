import type { ForeignKeyDbDefinition } from '#shared/classes/ForeignKeyDbTransformer';
import type { GenericObject } from '#shared/types';
import { ensureArray } from '#shared/utils';
import BaseScalarArrayType from './BaseScalarArrayType';

const ISVALID_SYMBOL = Symbol('Is Valid');

/** Scalar Array Schema Type */
class ArrayType extends BaseScalarArrayType {
	/** Get value from mv data */
	public get(record: unknown[]): unknown[] {
		const value = this.valueSchemaType.getFromMvData(record);

		return ensureArray(value).map((itemValue) => this.valueSchemaType.transformFromDb(itemValue));
	}

	/** Set specified array value into mv record */
	public set(originalRecord: unknown[], setValue: unknown): unknown[] {
		return this.valueSchemaType.setIntoMvData(
			originalRecord,
			ensureArray(setValue).map((value) => this.valueSchemaType.transformToDb(value)),
		);
	}

	/** Create an array of foreign key definitions that will be validated before save */
	public override transformForeignKeyDefinitionsToDb = (value: unknown): ForeignKeyDbDefinition[] =>
		ensureArray(value)
			.map((itemValue) => this.valueSchemaType.transformForeignKeyDefinitionsToDb(itemValue))
			.flat();

	/** Validate the array */
	public validate = async (value: unknown, document: GenericObject): Promise<string[]> => {
		const castValue = ensureArray(value);

		// combining all the validation into one array of promise.all
		// - validation against the values in the array will return an array of 0 to n errors for each value
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
					castValue.map((arrayItem) => this.valueSchemaType.validate(arrayItem, document)),
				),
			])
		)
			.flat(2)
			.filter((val): val is string => val !== ISVALID_SYMBOL);
	};
}

export default ArrayType;
