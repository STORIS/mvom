import { stub } from 'sinon';
import BaseDateType, { __RewireAPI__ as RewireAPI } from './BaseDateType';

describe('BaseDateType', () => {
	class DisallowDirectError extends Error {}
	beforeAll(() => {
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
	});

	afterAll(() => {
		__rewire_reset_all__();
	});

	describe('constructor', () => {
		test('should not be able to instantiate directly', () => {
			expect(() => new BaseDateType()).toThrow();
		});
	});

	describe('instance methods', () => {
		describe('transformToQuery', () => {
			let extension;
			beforeAll(() => {
				class Extension extends BaseDateType {}
				extension = new Extension({});
				stub(extension, 'transformToDb');
				extension.transformToDb.returnsArg(0);
			});

			beforeEach(() => {
				extension.transformToDb.resetHistory();
			});

			test('should call the instances transformToDb method', () => {
				extension.transformToQuery('foo');
				expect(extension.transformToDb.calledOnce).toBe(true);
			});

			test('should call the instances transformToDb method with the passed value', () => {
				extension.transformToQuery('foo');
				expect(extension.transformToDb.calledWith('foo')).toBe(true);
			});

			test('should return result of transformation if something other than empty string is passed', () => {
				expect(extension.transformToQuery('foo')).toBe('foo');
			});

			test('should return empty string if empty string is passed', () => {
				expect(extension.transformToQuery('')).toBe('');
			});

			test('should return empty string if null is passed', () => {
				expect(extension.transformToQuery(null)).toBe('');
			});
		});
	});
});
