import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import BaseType, { __RewireAPI__ as RewireAPI } from './';

describe('BaseType', () => {
	class NotImplementedError extends Error {}
	before(() => {
		chai.use(chaiAsPromised);
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
	});

	after(() => {
		RewireAPI.__ResetDependency__('NotImplementedError');
	});

	describe('constructor', () => {
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new BaseType());
		});
	});

	describe('instance methods', () => {
		let extension;
		before(() => {
			class Extension extends BaseType {}
			extension = new Extension();
		});

		describe('cast', () => {
			it('should return whatever was passed', () => {
				const param = 'foo';
				assert.strictEqual(extension.cast(param), param);
			});
		});

		describe('get', () => {
			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.get, NotImplementedError);
			});
		});

		describe('set', () => {
			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.set, NotImplementedError);
			});
		});

		describe('validate', () => {
			it('should reject with NotImplementedError if called', () =>
				assert.isRejected(extension.validate(), NotImplementedError));
		});
	});
});
