/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import StringType, { __RewireAPI__ as RewireAPI } from './';

describe('StringType', () => {
	class InvalidParameterError extends Error {}
	const handleEnumValidationResult = 'handleEnumValidation-result';
	const handleEnumValidation = stub().returns(handleEnumValidationResult);

	before(() => {
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
		RewireAPI.__Rewire__('handleEnumValidation', handleEnumValidation);
	});

	after(() => {
		__rewire_reset_all__();
	});

	beforeEach(() => {
		handleEnumValidation.resetHistory();
	});

	describe('constructor', () => {
		it('should throw InvalidParameterError if a path is not provided in the definition', () => {
			assert.throws(() => new StringType({}), InvalidParameterError);
		});

		it('should not throw if a path is provided in the definition', () => {
			assert.doesNotThrow(() => new StringType({ path: '1' }));
		});

		it('should throw InvalidParameterError if enum is provided and is not an array', () => {
			assert.throws(() => new StringType({ path: '1', enum: 'foo' }), InvalidParameterError);
		});

		it('should not throw if enum is provided and is an array', () => {
			assert.doesNotThrow(() => new StringType({ path: '1', enum: ['foo'] }));
		});

		it('should set _enum to the passed enum value', () => {
			const enumVal = ['foo'];
			const stringType = new StringType({ path: '1', enum: enumVal });
			assert.deepEqual(stringType._enum, enumVal);
		});

		it('should set _enum to null if it is not provided', () => {
			const stringType = new StringType({ path: '1' });
			assert.isNull(stringType._enum);
		});

		it('should call handleEnumValidation with the instance _validateEnum method', () => {
			const stringType = new StringType({ path: '1', enum: ['foo'] });
			assert.isTrue(handleEnumValidation.calledWith(stringType._validateEnum));
		});

		it('should add the result of handleEnumValidation to the list of validators', () => {
			const stringType = new StringType({ path: '1', enum: ['foo'] });
			assert.include(stringType._validators, handleEnumValidationResult);
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should return null if value is not provided', () => {
				assert.isNull(stringType.transformFromDb());
			});

			it('should return passed string value', () => {
				assert.strictEqual(stringType.transformFromDb('foo'), 'foo');
			});

			it('should return cast string value', () => {
				assert.strictEqual(stringType.transformFromDb(1337), '1337');
			});
		});

		describe('transformToDb', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should return a string without alteration', () => {
				assert.strictEqual(stringType.transformToDb('foo'), 'foo');
			});

			it('should return null if null passed', () => {
				assert.isNull(stringType.transformToDb(null));
			});

			it('should typecast if a non-string is passed', () => {
				assert.strictEqual(stringType.transformToDb(1234), '1234');
			});
		});

		describe('_validateEnum', () => {
			it('should skip enum validation and return true if value is null even if an enum property is provided', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				assert.isTrue(await stringType._validateEnum(null));
			});

			it('should return false if no value is ', async () => {
				const stringType = new StringType({ path: '1', required: false, enum: ['foo'] });
				assert.isTrue(await stringType._validateEnum(null));
			});

			it('should return true if no enum property was provided', async () => {
				const stringType = new StringType({ path: '1' });
				assert.isTrue(await stringType._validateEnum('foo'));
			});

			it('should return true if value is in the provided enum list', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				assert.isTrue(await stringType._validateEnum('foo'));
			});

			it('should return false if value is not in the provided enum list', async () => {
				const stringType = new StringType({ path: '1', enum: ['foo'] });
				assert.isFalse(await stringType._validateEnum('bar'));
			});
		});

		describe('_validateRequired', () => {
			let stringType;
			before(() => {
				stringType = new StringType({ path: '1' });
			});

			it('should resolve as false if value is undefined', async () => {
				assert.isFalse(await stringType._validateRequired());
			});

			it('should resolve as false if value is null', async () => {
				assert.isFalse(await stringType._validateRequired(null));
			});

			it('should resolve as false if value is empty string', async () => {
				assert.isFalse(await stringType._validateRequired(''));
			});

			it('should resolve as true if value is anything else', async () => {
				assert.isTrue(await stringType._validateRequired('foo'));
			});
		});
	});
});
