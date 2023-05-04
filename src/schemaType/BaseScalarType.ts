import { cloneDeep, set as setIn, toPath } from 'lodash';
import type Document from '../Document';
import { InvalidParameterError } from '../errors';
import type {
	DataTransformer,
	DecryptFn,
	EncryptFn,
	MvAttribute,
	MvDataType,
	MvRecord,
} from '../types';
import BaseSchemaType, { type Validator } from './BaseSchemaType';
import type { SchemaTypeDefinitionBoolean } from './BooleanType';
import type { SchemaTypeDefinitionISOCalendarDateTime } from './ISOCalendarDateTimeType';
import type { SchemaTypeDefinitionISOCalendarDate } from './ISOCalendarDateType';
import type { SchemaTypeDefinitionISOTime } from './ISOTimeType';
import type { SchemaTypeDefinitionNumber } from './NumberType';
import type { SchemaTypeDefinitionString } from './StringType';

// #region Types
export interface ScalarTypeConstructorOptions {
	encrypt?: EncryptFn;
	decrypt?: DecryptFn;
}

export type SchemaTypeDefinitionScalar =
	| SchemaTypeDefinitionBoolean
	| SchemaTypeDefinitionISOCalendarDateTime
	| SchemaTypeDefinitionISOCalendarDate
	| SchemaTypeDefinitionISOTime
	| SchemaTypeDefinitionNumber
	| SchemaTypeDefinitionString;

type RecordSetType = string | null | (string | null | (string | null)[])[];
// #endregion

const ISVALID_SYMBOL = Symbol('Is Valid');

/** Abstract Scalar Schema Type */
abstract class BaseScalarType extends BaseSchemaType implements DataTransformer {
	/** Data definition which this schema type was constructed from */
	public readonly definition: SchemaTypeDefinitionScalar;

	/** 0-indexed Array path */
	public readonly path: number[];

	/** Multivalue dictionary id */
	public readonly dictionary: string | null;

	/** Required validation value for the schema type */
	protected readonly required: boolean;

	/** Indicates whether data should be encrypted/decrypted */
	private readonly encrypted: boolean;

	/** Encrypt function to call on sensitive data before writing to the database */
	private readonly encrypt?: EncryptFn;

	/** Decrypt function to call on sensitive data encrypted in the database */
	private readonly decrypt?: DecryptFn;

	/** Data transformer */
	protected abstract readonly dataTransformer: DataTransformer;

	protected constructor(
		definition: SchemaTypeDefinitionScalar,
		{ encrypt, decrypt }: ScalarTypeConstructorOptions = {},
	) {
		super();

		const { path, dictionary = null, required = false, encrypted = false } = definition;

		if (encrypted) {
			if (typeof encrypt !== 'function') {
				throw new InvalidParameterError({
					message: 'Encrypt function required to process encrypted fields',
					parameterName: 'encrypt',
				});
			}

			if (typeof decrypt !== 'function') {
				throw new InvalidParameterError({
					message: 'Decrypt function required to process encrypted fields',
					parameterName: 'decrypt',
				});
			}
		}

		this.definition = definition;
		this.dictionary = dictionary;
		this.path = this.normalizeMvPath(path);
		this.required = required;
		this.encrypted = encrypted;
		this.encrypt = encrypt;
		this.decrypt = decrypt;
	}

	/** Get value from mv data */
	public get(record: MvRecord): unknown {
		const value = this.getFromMvData(record);
		return this.transformFromDb(value);
	}

	/** Transform into multivalue format and set specified value into mv record */
	public set(originalRecord: MvRecord, value: unknown): MvRecord {
		return this.setIntoMvData(originalRecord, this.transformToDb(value));
	}

	/** Transform from mv data to externally formatted data */
	public transformFromDb(value: unknown): unknown {
		return this.dataTransformer.transformFromDb(value);
	}

	/** Transform from externally formatted data to mv data */
	public transformToDb(value: unknown): string | null {
		return this.dataTransformer.transformToDb(value);
	}

	/** Transform query constants to the format schema */
	public transformToQuery(value: unknown): string {
		return this.dataTransformer.transformToQuery(value);
	}

	/** Validate the scalar type */
	public async validate(value: unknown, document: Document): Promise<string[]> {
		// combining all the validation into one array of promise.all
		// - a validator will return a placeholder symbol or the appropriate error message
		// - filter out the placeholder symbols to only return the error messages

		return (
			await Promise.all(
				this.validators
					.concat(this.createRequiredValidator(), this.createTypeValidator())
					.map(async ({ validationFn, message }) => {
						const isValid = await validationFn(value, document);
						return isValid ? ISVALID_SYMBOL : message;
					}),
			)
		).filter((val): val is string => val !== ISVALID_SYMBOL);
	}

	/** Get data from the specified keypath */
	public getFromMvData(record: MvRecord): MvAttribute {
		const value = this.getFromMvArray(this.path, record);
		return this.decryptData(value);
	}

	/** Set specified value into mv record */
	public setIntoMvData(originalRecord: MvRecord, setValue: RecordSetType): MvRecord {
		const encryptedSetValue = this.encryptData(setValue);
		return setIn(cloneDeep(originalRecord), this.path, encryptedSetValue);
	}

	/** Required validator */
	protected validateRequired = (value: unknown): boolean | Promise<boolean> =>
		!this.required || value != null;

	/** Type validator */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected validateType = (value: unknown, document: Document): boolean | Promise<boolean> => true;

	/** Create validation object for required validation */
	private createRequiredValidator(): Validator {
		const message = 'Property is required';

		return { validationFn: this.validateRequired, message };
	}

	/** Create validation object for type validation */
	private createTypeValidator(): Validator {
		const message = 'Property cannot be cast into the defined type';

		return { validationFn: this.validateType, message };
	}

	/**
	 * Convert a 1-index string array path definition (e.g. '1.1.1') to a 0-index array path definition (e.g. [0, 0, 0])
	 * @throws {@link InvalidParameterError} Path definition must be a string of integers split by periods
	 */
	private normalizeMvPath(path: string | number): number[] {
		return toPath(path).map((val) => {
			const numVal = +val;
			if (!Number.isInteger(numVal) || numVal < 1) {
				throw new InvalidParameterError({
					message: 'Path definition must be a string of integers split by periods',
					parameterName: 'path',
				});
			}
			return numVal - 1;
		});
	}

	/** Encrypt a transformed property */
	private encryptData(data: RecordSetType): RecordSetType {
		if (!this.encrypted) {
			return data;
		}

		if (Array.isArray(data)) {
			return data.map((value) => {
				if (Array.isArray(value)) {
					return value.map((innerValue) => this.encryptSingle(innerValue));
				}

				return this.encryptSingle(value);
			});
		}

		return this.encryptSingle(data);
	}

	/** Encrypt a single value */
	private encryptSingle(value: string | null): string | null {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return value == null ? value : this.encrypt!(value);
	}

	/** Decrypt a multivalue attribute */
	private decryptData(data: MvAttribute): MvAttribute {
		if (!this.encrypted) {
			return data;
		}

		if (Array.isArray(data)) {
			return data.map((value) => {
				if (Array.isArray(value)) {
					return value.map((innerValue) => this.decryptSingle(innerValue));
				}

				return this.decryptSingle(value);
			});
		}

		return this.decryptSingle(data);
	}

	/** Decrypt a single value */
	private decryptSingle(value: MvDataType): MvDataType {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return typeof value !== 'string' ? value : this.decrypt!(value);
	}
}

export default BaseScalarType;
