import { assert } from 'chai';
import handleDbServerError, { __RewireAPI__ as RewireAPI } from './';

describe('handleDbServerError', () => {
	class DbServerError extends Error {}
	class RecordLockedError extends Error {}
	class RecordVersionError extends Error {}
	const recordLocked = '1';
	const recordVersion = '2';
	const dbErrors = {
		recordLocked: { code: +recordLocked },
		recordVersion: { code: +recordVersion },
	};
	before(() => {
		RewireAPI.__Rewire__('DbServerError', DbServerError);
		RewireAPI.__Rewire__('RecordLockedError', RecordLockedError);
		RewireAPI.__Rewire__('RecordVersionError', RecordVersionError);
		RewireAPI.__Rewire__('dbErrors', dbErrors);
	});

	after(() => {
		RewireAPI.__ResetDependency__('DbServerError');
		RewireAPI.__ResetDependency__('RecordLockedError');
		RewireAPI.__ResetDependency__('RecordVersionError');
		RewireAPI.__ResetDependency__('dbErrors');
	});

	it('should throw with DbServerError if response is falsy', () => {
		const response = null;
		assert.throws(() => {
			handleDbServerError(response);
		}, DbServerError);
	});

	it('should throw with DbServerError if response has falsy data', () => {
		const response = {};
		assert.throws(() => {
			handleDbServerError(response);
		}, DbServerError);
	});

	it('should throw with DbServerError if response has falsy data.output', () => {
		const response = { data: {} };
		assert.throws(() => {
			handleDbServerError(response);
		}, DbServerError);
	});

	describe('errorCode evaluation', () => {
		it('should throw with RecordLockedError if response has recordLocked errorCode', () => {
			const response = { data: { output: { errorCode: recordLocked } } };
			assert.throws(() => {
				handleDbServerError(response);
			}, RecordLockedError);
		});

		it('should throw with RecordVersionError if response has recordVersion errorCode', () => {
			const response = { data: { output: { errorCode: recordVersion } } };
			assert.throws(() => {
				handleDbServerError(response);
			}, RecordVersionError);
		});

		it('should throw with DbServerError if response has any other truthy errorCode', () => {
			const response = { data: { output: { errorCode: '1337' } } };
			assert.throws(() => {
				handleDbServerError(response);
			}, DbServerError);
		});
	});

	it('should not throw if response output does not have an errorCode', () => {
		const response = { data: { output: {} } };
		assert.doesNotThrow(() => {
			handleDbServerError(response);
		});
	});
});
