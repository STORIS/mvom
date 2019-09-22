/* eslint-disable-next-line import/named */
import BaseType, { __RewireAPI__ as RewireAPI } from './BaseType';

describe('BaseType', () => {
	class NotImplementedError extends Error {}
	beforeAll(() => {
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('NotImplementedError');
	});

	describe('constructor', () => {
		test('should not be able to instantiate directly', () => {
			expect(() => new BaseType()).toThrow();
		});
	});

	describe('instance methods', () => {
		let extension;
		beforeAll(() => {
			class Extension extends BaseType {}
			extension = new Extension();
		});

		describe('cast', () => {
			test('should return whatever was passed', () => {
				const param = 'foo';
				expect(extension.cast(param)).toBe(param);
			});
		});

		describe('get', () => {
			test('should throw NotImplementedError if called', () => {
				expect(extension.get).toThrow();
			});
		});

		describe('set', () => {
			test('should throw NotImplementedError if called', () => {
				expect(extension.set).toThrow();
			});
		});

		describe('validate', () => {
			test('should reject with NotImplementedError if called', async () => {
				await expect(extension.validate()).rejects.toThrow(NotImplementedError);
			});
		});
	});
});
