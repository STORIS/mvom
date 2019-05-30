import { assert } from 'chai';
import { stub } from 'sinon';
import createConnection, { __RewireAPI__ as RewireAPI } from './';

describe('createConnection', () => {
	const Connection = stub();
	const dummyLogger = stub();

	before(() => {
		RewireAPI.__Rewire__('Connection', Connection);
		RewireAPI.__Rewire__('dummyLogger', dummyLogger);
	});

	after(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('dummyLogger');
	});

	beforeEach(() => {
		Connection.resetHistory();
	});

	it('should return an instance of Connection object', () => {
		assert.instanceOf(createConnection('foo', 'bar'), Connection);
		assert.isTrue(
			Connection.calledWith({
				connectionManagerUri: 'foo',
				account: 'bar',
				logger: dummyLogger,
				cacheMaxAge: 3600,
				timeout: 0,
			}),
			'Connection constructor should be called with expected parameters',
		);
	});

	describe('overrides', () => {
		it('should allow the logger to be overridden', () => {
			const logger = 'logger-value';
			createConnection('foo', 'bar', { logger });

			assert.strictEqual(Connection.args[0][0].logger, logger);
		});

		it('should allow the cacheMaxAge to be overridden', () => {
			const cacheMaxAge = 1337;
			createConnection('foo', 'bar', { cacheMaxAge });

			assert.strictEqual(Connection.args[0][0].cacheMaxAge, cacheMaxAge);
		});

		it('should allow the timeout to be overridden', () => {
			const timeout = 1337;
			createConnection('foo', 'bar', { timeout });

			assert.strictEqual(Connection.args[0][0].timeout, timeout);
		});
	});

	describe('errors', () => {
		it('should throw if connectionManagerUri is not provided in parameters', () => {
			assert.throws(createConnection.bind('test', undefined, 'foo'));
		});

		it('should throw if account is not provided in parameters', () => {
			assert.throws(createConnection.bind('test', 'foo'));
		});

		it('should throw if cacheMaxAge is not a number', () => {
			assert.throws(createConnection.bind('test', 'foo', 'bar', { cacheMaxAge: 'baz' }));
		});

		it('should throw if cacheMaxAge is not an integer', () => {
			assert.throws(createConnection.bind('test', 'foo', 'bar', { cacheMaxAge: 1.23 }));
		});

		it('should throw if timeout is not an integer', () => {
			assert.throws(createConnection.bind('test', 'foo', 'bar', { timeout: 1.23 }));
		});
	});
});
