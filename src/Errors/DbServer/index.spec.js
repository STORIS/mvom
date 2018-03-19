import { assert } from 'chai';
import DbServerError, { __RewireAPI__ as RewireAPI } from './';

describe('DbServerError', () => {
	before(() => {
		RewireAPI.__Rewire__('dbErrors', { foo: { code: 1, message: 'bar' } });
	});

	after(() => {
		RewireAPI.__ResetDependency__('dbErrors');
	});

	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new DbServerError();
			assert.strictEqual(error.name, 'DbServerError');
			assert.strictEqual(error.message, 'Unknown database server error');
		});

		it('should override default message', () => {
			const error = new DbServerError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should use default message if errorCode cannot be found in dbErrors', () => {
			const error = new DbServerError({ errorCode: 'notfound' });
			assert.strictEqual(error.message, 'Unknown database server error');
		});

		it('should use message from dbError code if errorCode is found in dbErrors', () => {
			const error = new DbServerError({ errorCode: 1 });
			assert.strictEqual(error.message, 'bar');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new DbServerError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
