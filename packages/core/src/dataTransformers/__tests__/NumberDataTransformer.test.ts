import { InvalidParameterError, TransformDataError } from '../../errors';
import NumberDataTransformer from '../NumberDataTransformer';

describe('constructor', () => {
	test('should throw if dbDecimals is less than 0', () => {
		expect(() => {
			new NumberDataTransformer(-1);
		}).toThrow(InvalidParameterError);
	});

	test('should throw if dbDecimals is not an integer', () => {
		expect(() => {
			new NumberDataTransformer(1.1);
		}).toThrow(InvalidParameterError);
	});
});

describe('transformFromDb', () => {
	test('should return null if value is null', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformFromDb(null)).toBeNull();
	});

	test('should return integer if no dbDecimals conversion specified', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformFromDb(1234)).toBe(1234);
	});

	test('should return decimal if dbDecimals conversion specified', () => {
		const numberDataTransformer = new NumberDataTransformer(2);

		expect(numberDataTransformer.transformFromDb(1234)).toBe(12.34);
	});

	test('should remove decimals from formatted data by rounding before converting', () => {
		const numberDataTransformer = new NumberDataTransformer(2);

		expect(numberDataTransformer.transformFromDb(1234.5)).toBe(12.35);
	});

	test('should throw TransformDataError if value is not a finite number', () => {
		const numberDataTransformer = new NumberDataTransformer(2);

		expect(() => {
			numberDataTransformer.transformFromDb('foo');
		}).toThrow(TransformDataError);
	});
});

describe('transformToDb', () => {
	test('should return null if value is null', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformToDb(null)).toBeNull();
	});

	test('should return supplied integer value if no dbDecimals specified', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformToDb(1234)).toBe('1234');
	});

	test('should round decimals from supplied value if no dbDecimals specified', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformToDb(1234.5)).toBe('1235');
	});

	test('should return converted internally formatted number when dbDecimals is specified', () => {
		const numberDataTransformer = new NumberDataTransformer(2);

		expect(numberDataTransformer.transformToDb(1234.5)).toBe('123450');
	});

	test('should round excess decimals and return converted internally formatted number when dbDecimals is specified', () => {
		const numberDataTransformer = new NumberDataTransformer(2);

		expect(numberDataTransformer.transformToDb(1234.567)).toBe('123457');
	});
});

describe('transformToQuery', () => {
	test('should return string representation of value input', () => {
		const numberDataTransformer = new NumberDataTransformer();

		expect(numberDataTransformer.transformToQuery(1234.567)).toBe('1234.567');
	});
});
