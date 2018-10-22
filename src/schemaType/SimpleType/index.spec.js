/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import SimpleType, { __RewireAPI__ as RewireAPI } from './';

describe('SimpleType', () => {
	class NotImplementedError extends Error {}
	const getFromMvArray = stub();
	const requiredValidator = stub();
	const handleRequiredValidation = stub().returns({
		validator: requiredValidator,
		message: 'requiredValidator',
	});
	before(() => {
		RewireAPI.__Rewire__('NotImplementedError', NotImplementedError);
		RewireAPI.__Rewire__('getFromMvArray', getFromMvArray);
		RewireAPI.__Rewire__('handleRequiredValidation', handleRequiredValidation);
	});

	after(() => {
		__rewire_reset_all__();
	});

	beforeEach(() => {
		getFromMvArray.reset();
	});

	describe('constructor', () => {
		class Extension extends SimpleType {}
		it('should not be able to instantiate directly', () => {
			assert.throws(() => new SimpleType());
		});

		it('should set dictionary to the dictionary property of the definition parameter', () => {
			const extension = new Extension({ dictionary: 'foo' });
			assert.strictEqual(extension.dictionary, 'foo');
		});
	});

	describe('instance methods', () => {
		describe('get', () => {
			let extension;
			const getFromMvData = stub();
			const transformFromDb = stub();
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
				extension.getFromMvData = getFromMvData;
				extension.transformFromDb = transformFromDb;
			});

			beforeEach(() => {
				getFromMvData.reset();
				transformFromDb.reset();
			});

			it('should return transformed data', () => {
				getFromMvData.returns('foo');
				transformFromDb.returns('bar');
				assert.strictEqual(extension.get(), 'bar');
			});
		});

		describe('getFromMvData', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			beforeEach(() => {
				extension.path = null;
			});

			it("should call getFromMvArray with the passed record and the instance's path", () => {
				extension.path = [1];
				extension.getFromMvData(['foo']);
				assert.deepEqual(getFromMvArray.args[0][0], ['foo']);
				assert.deepEqual(getFromMvArray.args[0][1], [1]);
			});

			it('should return the value returned from getFromMvArray', () => {
				getFromMvArray.returns('foo');
				assert.strictEqual(extension.getFromMvData(), 'foo');
			});
		});

		describe('set', () => {
			let extension;
			const setIntoMvData = stub();
			const transformToDb = stub();
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
				extension.setIntoMvData = setIntoMvData;
				extension.transformToDb = transformToDb;
			});

			beforeEach(() => {
				setIntoMvData.reset();
				transformToDb.reset();
			});

			it('should call transformToDb with passed parameter', () => {
				extension.set([], 'foo');
				assert.isTrue(transformToDb.calledWith('foo'));
			});

			it('should call setIntoMvData with passed parameter and result of transformToDb', () => {
				transformToDb.returns('qux');
				extension.set(['foo', 'bar'], 'baz');
				assert.deepEqual(setIntoMvData.args[0][0], ['foo', 'bar']);
				assert.strictEqual(setIntoMvData.args[0][1], 'qux');
			});

			it('should return result of setIntoMvData', () => {
				setIntoMvData.returns('foo');
				assert.strictEqual(extension.set([], ''), 'foo');
			});
		});

		describe('setIntoMvData', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should return unchanged array if instance path is null', () => {
				extension.path = null;
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar']), ['foo', 'bar']);
			});

			it('should set the value at the array position specifed by the path', () => {
				extension.path = [2];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), ['foo', 'bar', 'baz']);
			});

			it('should set the value at the nested array position specifed by the path', () => {
				extension.path = [2, 1];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), [
					'foo',
					'bar',
					[undefined, 'baz'],
				]);
			});

			it('should set the value at the deeply nested array position specifed by the path', () => {
				extension.path = [2, 1, 1];
				assert.deepEqual(extension.setIntoMvData(['foo', 'bar'], 'baz'), [
					'foo',
					'bar',
					[undefined, [undefined, 'baz']],
				]);
			});
		});

		describe('transformFromDb', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.transformFromDb, NotImplementedError);
			});
		});

		describe('transformToDb', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should throw NotImplementedError if called', () => {
				assert.throws(extension.transformToDb, NotImplementedError);
			});
		});

		describe('transformToQuery', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should return the value passed in', () => {
				assert.strictEqual(extension.transformToQuery('foo'), 'foo');
			});
		});

		describe('validate', () => {
			let extension;
			const fooValidator = stub();
			const barValidator = stub();
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
				extension._validators.push({ validator: fooValidator, message: 'foo' });
				extension._validators.push({ validator: barValidator, message: 'bar' });
			});

			beforeEach(() => {
				fooValidator.reset();
				barValidator.reset();
				requiredValidator.reset();
			});

			it('should return an array of any errors from the required validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				assert.deepEqual(await extension.validate(), ['requiredValidator']);
			});

			it('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(true);
				requiredValidator.resolves(false);
				assert.deepEqual(await extension.validate(), ['foo', 'requiredValidator']);
			});

			it('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				requiredValidator.resolves(false);
				assert.deepEqual(await extension.validate(), ['foo', 'bar', 'requiredValidator']);
			});

			it('should return an empty array if no errors are found', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				requiredValidator.resolves(true);
				assert.deepEqual(await extension.validate(), []);
			});
		});

		describe('_normalizeMvPath', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			beforeEach(() => {
				extension.path = 'testMe';
			});

			it('should set path to null if path is not provided', () => {
				extension._normalizeMvPath();
				assert.deepEqual(extension.path, null);
			});

			it('should throw an error if an integer-like string is not provided', () => {
				assert.throws(extension._normalizeMvPath.bind(extension, 'foo'));
			});

			it('should throw an error if an integer-like string is provided but is less than 1', () => {
				assert.throws(extension._normalizeMvPath.bind(extension, '0'));
			});

			it('should return an array of integers with a value one less than the parameter', () => {
				extension._normalizeMvPath('1');
				assert.deepEqual(extension.path, [0]);
			});

			it('should return an array of integers with a value one less than the parameter when a nested path is provided', () => {
				extension._normalizeMvPath('1.2');
				assert.deepEqual(extension.path, [0, 1]);
			});
		});

		describe('_validateRequired', () => {
			let extension;
			before(() => {
				const Extension = class extends SimpleType {};
				extension = new Extension({});
			});

			it('should resolve as false if value is undefined', async () => {
				assert.isFalse(await extension._validateRequired());
			});

			it('should resolve as false if value is null', async () => {
				assert.isFalse(await extension._validateRequired(null));
			});

			it('should resolve as true if value is anything else', async () => {
				assert.isTrue(await extension._validateRequired('foo'));
			});
		});
	});
});
