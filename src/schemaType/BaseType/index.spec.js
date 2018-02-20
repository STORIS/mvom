import { assert } from 'chai';
import BaseType from './';

describe('BaseType', () => {
	describe('constructor', () => {
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new BaseType());
		});
	});

	describe('instance methods', () => {
		describe('transformFromDb', () => {
			let extension;
			before(() => {
				const Extension = class extends BaseType {};
				extension = new Extension();
			});

			it('should return the passed value parameter', () => {
				assert.strictEqual(extension.transformFromDb('foo'), 'foo');
			});
		});

		describe('transformToDb', () => {
			let extension;
			before(() => {
				const Extension = class extends BaseType {};
				extension = new Extension();
			});

			it('should return the passed value parameter', () => {
				assert.strictEqual(extension.transformToDb('foo'), 'foo');
			});
		});
	});
});
