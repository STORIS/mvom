import { stub } from 'sinon';
import SimpleType, { __RewireAPI__ as RewireAPI } from './SimpleType';

describe('SimpleType', () => {
	class NotImplementedError extends Error {}
	const getFromMvArray = stub();
	const requiredValidator = stub();
	const handleRequiredValidation = stub().returns({
		validator: requiredValidator,
		message: 'requiredValidator',
	});
	beforeAll(() => {
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
		RewireAPI.__Rewire__('getFromMvArray', getFromMvArray);
		RewireAPI.__Rewire__('handleRequiredValidation', handleRequiredValidation);
	});

	afterAll(() => {
		__rewire_reset_all__();
	});

	beforeEach(() => {
		getFromMvArray.reset();
	});

	describe('constructor', () => {
		class Extension extends SimpleType {}
		test('should not be able to instantiate directly', () => {
			expect(() => new SimpleType()).toThrow();
		});

		test('should set dictionary to the dictionary property of the definition parameter', () => {
			const extension = new Extension({ dictionary: 'foo' });
			expect(extension.dictionary).toBe('foo');
		});

		test('should throw if the property is set as encrypted but the encrypt function is not provided', () => {
			expect(() => new Extension({ encrypted: true }, { decrypt: () => {} })).toThrow();
		});

		test('should throw if the property is set as encrypted but the decrypt function is not provided', () => {
			expect(() => new Extension({ encrypted: true }, { encrypt: () => {} })).toThrow();
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			let extension;
			const getFromMvData = stub();
			const transformFromDb = stub();
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
				extension.getFromMvData = getFromMvData;
				extension.transformFromDb = transformFromDb;
			});

			beforeEach(() => {
				getFromMvData.reset();
				transformFromDb.reset();
			});

			test('should return transformed data', () => {
				getFromMvData.returns('foo');
				transformFromDb.returns('bar');
				expect(extension.get()).toBe('bar');
			});
		});

		describe('getFromMvData', () => {
			let extension;
			const encrypt = jest.fn();
			const decrypt = jest.fn();

			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			beforeEach(() => {
				decrypt.mockImplementation((...args) => args[0]);
				extension.path = null;
			});

			test("should call getFromMvArray with the passed record and the instance's path", () => {
				extension.path = [1];
				extension.getFromMvData(['foo']);
				expect(getFromMvArray.args[0][0]).toEqual([1]);
				expect(getFromMvArray.args[0][1]).toEqual(['foo']);
			});

			test('should return the value returned from getFromMvArray', () => {
				getFromMvArray.returns('foo');
				expect(extension.getFromMvData()).toBe('foo');
			});

			test('should not decrypt the value if the field is not marked as encrypted', () => {
				class Extension extends SimpleType {}
				extension = new Extension({ encrypted: false }, { encrypt, decrypt });
				getFromMvArray.returns('foo');
				expect(extension.getFromMvData()).toBe('foo');
				expect(decrypt).not.toHaveBeenCalled();
			});

			test('should decrypt the value if the field is marked as encrypted', () => {
				class Extension extends SimpleType {}
				extension = new Extension({ encrypted: true }, { encrypt, decrypt });
				getFromMvArray.returns('foo');
				expect(extension.getFromMvData()).toBe('foo');
				expect(decrypt).toHaveBeenCalledWith('foo');
			});
		});

		describe('set', () => {
			let extension;
			const setIntoMvData = stub();
			const transformToDb = stub();
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
				extension.setIntoMvData = setIntoMvData;
				extension.transformToDb = transformToDb;
			});

			beforeEach(() => {
				setIntoMvData.reset();
				transformToDb.reset();
			});

			test('should call transformToDb with passed parameter', () => {
				extension.set([], 'foo');
				expect(transformToDb.calledWith('foo')).toBe(true);
			});

			test('should call setIntoMvData with passed parameter and result of transformToDb', () => {
				transformToDb.returns('qux');
				extension.set(['foo', 'bar'], 'baz');
				expect(setIntoMvData.args[0][0]).toEqual(['foo', 'bar']);
				expect(setIntoMvData.args[0][1]).toBe('qux');
			});

			test('should return result of setIntoMvData', () => {
				setIntoMvData.returns('foo');
				expect(extension.set([], '')).toBe('foo');
			});
		});

		describe('setIntoMvData', () => {
			let extension;
			const encrypt = jest.fn();
			const decrypt = jest.fn();

			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			beforeEach(() => {
				encrypt.mockImplementation((...args) => args[0]);
			});

			test('should return unchanged array if instance path is null', () => {
				extension.path = null;
				expect(extension.setIntoMvData(['foo', 'bar'])).toEqual(['foo', 'bar']);
			});

			test('should set the value at the array position specified by the path', () => {
				extension.path = [2];
				expect(extension.setIntoMvData(['foo', 'bar'], 'baz')).toEqual(['foo', 'bar', 'baz']);
			});

			test('should set the value at the nested array position specified by the path', () => {
				extension.path = [2, 1];
				expect(extension.setIntoMvData(['foo', 'bar'], 'baz')).toEqual([
					'foo',
					'bar',
					[undefined, 'baz'],
				]);
			});

			test('should set the value at the deeply nested array position specified by the path', () => {
				extension.path = [2, 1, 1];
				expect(extension.setIntoMvData(['foo', 'bar'], 'baz')).toEqual([
					'foo',
					'bar',
					[undefined, [undefined, 'baz']],
				]);
			});

			test('should not encrypt the value if the field is not marked as encrypted', () => {
				class Extension extends SimpleType {}
				extension = new Extension({ encrypted: false }, { encrypt, decrypt });
				extension.path = [2];
				expect(extension.setIntoMvData(['foo', 'bar'], 'baz')).toEqual(['foo', 'bar', 'baz']);
				expect(encrypt).not.toHaveBeenCalled();
			});

			test('should encrypt the value if the field is marked as encrypted', () => {
				class Extension extends SimpleType {}
				extension = new Extension({ encrypted: true }, { encrypt, decrypt });
				extension.path = [2];
				expect(extension.setIntoMvData(['foo', 'bar'], 'baz')).toEqual(['foo', 'bar', 'baz']);
				expect(encrypt).toHaveBeenCalledWith('baz');
			});
		});

		describe('transformFromDb', () => {
			let extension;
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.transformFromDb).toThrow();
			});
		});

		describe('transformToDb', () => {
			let extension;
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			test('should throw NotImplementedError if called', () => {
				expect(extension.transformToDb).toThrow();
			});
		});

		describe('transformToQuery', () => {
			let extension;
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			test('should return the value passed in', () => {
				expect(extension.transformToQuery('foo')).toBe('foo');
			});
		});

		describe('validate', () => {
			let extension;
			const fooValidator = stub();
			const barValidator = stub();
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
				extension._validators.push({ validator: fooValidator, message: 'foo' });
				extension._validators.push({ validator: barValidator, message: 'bar' });
			});

			beforeEach(() => {
				fooValidator.reset();
				barValidator.reset();
				requiredValidator.reset();
			});

			test('should return an array of any errors from the required validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				expect(await extension.validate()).toEqual(['requiredValidator']);
			});

			test('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				expect(await extension.validate()).toEqual(['foo', 'requiredValidator']);
			});

			test('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				expect(await extension.validate()).toEqual(['foo', 'bar', 'requiredValidator']);
			});

			test('should return an empty array if no errors are found', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				expect(await extension.validate()).toEqual([]);
			});
		});

		describe('_normalizeMvPath', () => {
			let extension;
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			beforeEach(() => {
				extension.path = 'testMe';
			});

			test('should set path to null if path is not provided', () => {
				extension._normalizeMvPath();
				expect(extension.path).toBeNull();
			});

			test('should throw an error if an integer-like string is not provided', () => {
				expect(extension._normalizeMvPath.bind(extension, 'foo')).toThrow();
			});

			test('should throw an error if an integer-like string is provided but is less than 1', () => {
				expect(extension._normalizeMvPath.bind(extension, '0')).toThrow();
			});

			test('should return an array of integers with a value one less than the parameter', () => {
				extension._normalizeMvPath('1');
				expect(extension.path).toEqual([0]);
			});

			test('should return an array of integers with a value one less than the parameter when a nested path is provided', () => {
				extension._normalizeMvPath('1.2');
				expect(extension.path).toEqual([0, 1]);
			});
		});

		describe('_validateRequired', () => {
			let extension;
			beforeAll(() => {
				class Extension extends SimpleType {}
				extension = new Extension({});
			});

			test('should resolve as false if value is undefined', async () => {
				expect(await extension._validateRequired()).toBe(false);
			});

			test('should resolve as false if value is null', async () => {
				expect(await extension._validateRequired(null)).toBe(false);
			});

			test('should resolve as true if value is anything else', async () => {
				expect(await extension._validateRequired('foo')).toBe(true);
			});
		});
	});
});
