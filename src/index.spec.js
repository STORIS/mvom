import { assert } from 'chai';
import { stub } from 'sinon';
import mvom, { __RewireAPI__ as RewireAPI } from './';

describe('mvom', () => {
	describe('createConnection method', () => {
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
			assert.instanceOf(mvom.createConnection('foo', 'bar'), Connection);
			assert.isTrue(
				Connection.calledWith({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: dummyLogger,
					cacheMaxAge: 3600,
				}),
				'Connection constructor should be called with expected parameters',
			);
		});

		describe('overrides', () => {
			it('should allow the logger to be overridden', () => {
				const logger = 'logger-value';
				mvom.createConnection('foo', 'bar', { logger });

				assert.strictEqual(Connection.args[0][0].logger, logger);
			});

			it('should allow the cacheMaxAge to be overridden', () => {
				const cacheMaxAge = 1337;
				mvom.createConnection('foo', 'bar', { cacheMaxAge });

				assert.strictEqual(Connection.args[0][0].cacheMaxAge, cacheMaxAge);
			});
		});

		describe('errors', () => {
			it('should throw if connectionManagerUri is not provided in parameters', () => {
				assert.throws(mvom.createConnection.bind(mvom, null, 'foo'));
			});

			it('should throw if account is not provided in options', () => {
				assert.throws(mvom.createConnection.bind(mvom, 'foo', null));
			});

			it('should throw if cacheMaxAge is not a number', () => {
				assert.throws(mvom.createConnection.bind(mvom, 'foo', 'bar', { cacheMaxAge: 'baz' }));
			});

			it('should throw if cacheMaxAge is not an integer', () => {
				assert.throws(mvom.createConnection.bind(mvom, 'foo', 'bar', { cacheMaxAge: 1.23 }));
			});
		});
	});
});
