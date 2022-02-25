import { cloneDeep, set as setIn, toPath } from 'lodash';
import { InvalidParameterError } from '#shared/errors';
import type { DecryptFunc, EncryptFunc, GenericObject, SchemaValidator } from '#shared/types';
import { getFromMvArray, handleRequiredValidation } from '#shared/utils';
import BaseType from './BaseType';

export interface ScalarTypeConstructorOptions {
	encrypt?: EncryptFunc<unknown>;
	decrypt?: DecryptFunc<unknown>;
}

const ISVALID_SYMBOL = Symbol('Is Valid');

/** Abstract Scalar Schema Type */
abstract class ScalarType extends BaseType {
	/** Data definition which this schema type was constructed from */
	public definition: GenericObject;

	/** 0-indexed Array path */
	public path: number[] | null;

	/** Multivalue dictionary id */
	public dictionary: string | null;

	/** Required validation value for the schema type */
	private required: boolean | SchemaValidator;

	/** Indicates whether data should be encrypted/decrypted */
	private encrypted: boolean;

	/** Encrypt function to call on sensitive data before writing to the database */
	private encrypt?: EncryptFunc<unknown>;

	/** Decrypt function to call on sensitive data encrypted in the database */
	private decrypt?: DecryptFunc<unknown>;

	protected constructor(
		definition: GenericObject = {},
		{ encrypt, decrypt }: ScalarTypeConstructorOptions = {},
	) {
		super();

		const { dictionary = null, path = null, required = false, encrypted = false } = definition;

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
	public get = (record: unknown[]): unknown => {
		const value = this.getFromMvData(record);
		return this.transformFromDb(value);
	};

	/** Transform into multivalue format and set specified value into mv record */
	public set = (originalRecord: unknown[], value: unknown): unknown =>
		this.setIntoMvData(originalRecord, this.transformToDb(value));

	/** Transform query constants to the format schema */
	public transformToQuery(value: unknown): unknown {
		return value;
	}

	/** Validate the scalar type */
	public async validate(value: unknown, document: GenericObject): Promise<string[]> {
		// combining all the validation into one array of promise.all
		// - a validator will return a placeholder symbol or the appropriate error message
		// - filter out the placeholder symbols to only return the error messages

		return (
			await Promise.all(
				this.validators
					.concat(handleRequiredValidation(this.required, this.validateRequired))
					.map(async ({ validator, message }) => {
						const isValid = await validator(value, document);
						return isValid ? ISVALID_SYMBOL : message;
					}),
			)
		).filter((val): val is string => val !== ISVALID_SYMBOL);
	}

	/** Get data from the specified keypath */
	public getFromMvData = (record: unknown[]): unknown => {
		if (this.path == null) {
			return null;
		}

		const value = getFromMvArray(this.path, record);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.encrypted ? this.decrypt!(value) : value;
	};

	/** Set specified value into mv record */
	public setIntoMvData = (originalRecord: unknown[], setValue: unknown): unknown[] => {
		if (this.path == null) {
			return originalRecord;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const encryptedSetValue = this.encrypted ? this.encrypt!(setValue) : setValue;
		return setIn(cloneDeep(originalRecord), this.path, encryptedSetValue);
	};

	/** Required validator */
	protected async validateRequired(value: unknown): Promise<boolean> {
		return Promise.resolve(value != null);
	}

	/**
	 * Convert a 1-index string array path definition (e.g. '1.1.1') to a 0-index array path definition (e.g. [0, 0, 0])
	 * @throws {@link InvalidParameterError} Path definition must be a string of integers split by periods
	 */
	private normalizeMvPath = (path: string): number[] | null => {
		if (path == null) {
			return null;
		}

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
	};

	/** Transform from mv data to externally formatted data */
	public abstract transformFromDb(value: unknown): unknown;

	/** Transform from externally formatted data to mv data */
	public abstract transformToDb(value: unknown): unknown;
}

export default ScalarType;
