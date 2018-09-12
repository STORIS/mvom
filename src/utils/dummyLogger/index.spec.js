import { assert } from 'chai';
import dummyLogger from './';

describe('dummyLogger', () => {
	it('error', () => {
		assert.isFunction(dummyLogger.error);
		assert.isUndefined(dummyLogger.error());
	});

	it('warn', () => {
		assert.isFunction(dummyLogger.warn);
		assert.isUndefined(dummyLogger.warn());
	});

	it('info', () => {
		assert.isFunction(dummyLogger.info);
		assert.isUndefined(dummyLogger.info());
	});

	it('verbose', () => {
		assert.isFunction(dummyLogger.verbose);
		assert.isUndefined(dummyLogger.verbose());
	});

	it('debug', () => {
		assert.isFunction(dummyLogger.debug);
		assert.isUndefined(dummyLogger.debug());
	});

	it('silly', () => {
		assert.isFunction(dummyLogger.silly);
		assert.isUndefined(dummyLogger.silly());
	});
});
