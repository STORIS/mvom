import { stub } from 'sinon';
import createConnection, { __RewireAPI__ as RewireAPI } from './createConnection';

describe('createConnection', () => {
	const connection = stub();
	const dummyLogger = stub();

	beforeAll(() => {
		RewireAPI.__Rewire__('Connection', connection);
		RewireAPI.__Rewire__('dummyLogger', dummyLogger);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('dummyLogger');
	});

	beforeEach(() => {
		connection.resetHistory();
	});

	test('should return an instance of Connection object', () => {
		expect(createConnection('foo', 'bar')).toBeInstanceOf(connection);
		expect(
			connection.calledWith({
				connectionManagerUri: 'foo',
				account: 'bar',
				logger: dummyLogger,
				cacheMaxAge: 3600,
				timeout: 0,
			}),
		).toBe(true);
	});

	describe('overrides', () => {
		test('should allow the logger to be overridden', () => {
			const logger = 'logger-value';
			createConnection('foo', 'bar', { logger });

			expect(connection.args[0][0].logger).toBe(logger);
		});

		test('should allow the cacheMaxAge to be overridden', () => {
			const cacheMaxAge = 1337;
			createConnection('foo', 'bar', { cacheMaxAge });

			expect(connection.args[0][0].cacheMaxAge).toBe(cacheMaxAge);
		});

		test('should allow the timeout to be overridden', () => {
			const timeout = 1337;
			createConnection('foo', 'bar', { timeout });

			expect(connection.args[0][0].timeout).toBe(timeout);
		});
	});

	describe('errors', () => {
		test('should throw if connectionManagerUri is not provided in parameters', () => {
			expect(createConnection.bind('test', undefined, 'foo')).toThrow();
		});

		test('should throw if account is not provided in parameters', () => {
			expect(createConnection.bind('test', 'foo')).toThrow();
		});

		test('should throw if cacheMaxAge is not a number', () => {
			expect(createConnection.bind('test', 'foo', 'bar', { cacheMaxAge: 'baz' })).toThrow();
		});

		test('should throw if cacheMaxAge is not an integer', () => {
			expect(createConnection.bind('test', 'foo', 'bar', { cacheMaxAge: 1.23 })).toThrow();
		});

		test('should throw if timeout is not an integer', () => {
			expect(createConnection.bind('test', 'foo', 'bar', { timeout: 1.23 })).toThrow();
		});
	});
});
