/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import BaseDateType, { __RewireAPI__ as RewireAPI } from './';

describe('BaseDateType', () => {
	class DisallowDirectError extends Error {}
	before(() => {
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
	});

	after(() => {
		__rewire_reset_all__();
	});

	describe('constructor', () => {
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new BaseDateType(), DisallowDirectError);
		});
	});

	describe('instance methods', () => {
		describe('transformToQuery', () => {
			let extension;
			before(() => {
				const Extension = class extends BaseDateType {};
				extension = new Extension({});
				stub(extension, 'transformToDb');
				extension.transformToDb.returnsArg(0);
			});

			beforeEach(() => {
				extension.transformToDb.resetHistory();
			});

			it('should call the instances transformToDb method', () => {
				extension.transformToQuery('foo');
				assert.isTrue(extension.transformToDb.calledOnce);
			});

			it('should call the instances transformToDb method with the passed value', () => {
				extension.transformToQuery('foo');
				assert.isTrue(extension.transformToDb.calledWith('foo'));
			});

			it('should return result of transformation if something other than empty string is passed', () => {
				assert.strictEqual(extension.transformToQuery('foo'), 'foo');
			});

			it('should return empty string if empty string is passed', () => {
				assert.strictEqual(extension.transformToQuery(''), '');
			});

			it('should return empty string if null is passed', () => {
				assert.strictEqual(extension.transformToQuery(null), '');
			});
		});
	});
});
