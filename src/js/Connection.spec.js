import { stub, useFakeTimers } from 'sinon';
import {
	dbErrors,
	ISOCalendarDateFormat,
	ISOCalendarDateTimeFormat,
	ISOTimeFormat,
	mvEpoch,
} from '#shared/constants';
import { mockLogger } from '#test/helpers';
import Connection, { CONNECTION_STATUS, __RewireAPI__ as RewireAPI } from './Connection';

describe('Connection', () => {
	class ConnectionManagerError extends Error {}
	class InvalidParameterError extends Error {}
	class DbServerError extends Error {}
	class ForeignKeyValidationError extends Error {}
	class RecordLockedError extends Error {}
	class RecordVersionError extends Error {}

	beforeAll(() => {
		RewireAPI.__Rewire__('ConnectionManagerError', ConnectionManagerError);
		RewireAPI.__Rewire__('DbServerError', DbServerError);
		RewireAPI.__Rewire__('ForeignKeyValidationError', ForeignKeyValidationError);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
		RewireAPI.__Rewire__('RecordLockedError', RecordLockedError);
		RewireAPI.__Rewire__('RecordVersionError', RecordVersionError);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('ConnectionManagerError');
		RewireAPI.__ResetDependency__('DbServerError');
		RewireAPI.__ResetDependency__('ForeignKeyValidationError');
		RewireAPI.__ResetDependency__('InvalidParameterError');
		RewireAPI.__ResetDependency__('RecordLockedError');
		RewireAPI.__ResetDependency__('RecordVersionError');
	});

	describe('static methods', () => {
		describe('getUnibasicSource', () => {
			const readFile = stub().resolves('foo');
			beforeAll(() => {
				RewireAPI.__Rewire__('fs', { readFile });
				RewireAPI.__Rewire__('path', { join: stub().returns('bar') });
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('fs');
				RewireAPI.__ResetDependency__('path');
			});

			beforeEach(() => {
				readFile.resetHistory();
			});

			test('should call readFile with the output from path.join()', async () => {
				await Connection.getUnibasicSource('baz');
				expect(readFile.calledWith('bar', 'utf8')).toBe(true);
			});

			test('should return the result of fs.readFile()', async () => {
				expect(await Connection.getUnibasicSource('baz')).toBe('foo');
			});
		});

		describe('handleDbServerError', () => {
			test('should throw a db server error if no response is given', () => {
				const response = undefined;
				expect(() => Connection.handleDbServerError(response)).toThrow(DbServerError);
			});

			test('should throw a db server error if the response has no data', () => {
				const response = { foo: 'bar' };
				expect(() => Connection.handleDbServerError(response)).toThrow(DbServerError);
			});

			test('should throw a db server error if the response data has no output', () => {
				const response = { data: { foo: 'bar' } };
				expect(() => Connection.handleDbServerError(response)).toThrow(DbServerError);
			});

			test('should throw a foreign key validation error if the foreign key validation error code is returned from the database', () => {
				const response = { data: { output: { errorCode: dbErrors.foreignKeyValidation.code } } };
				expect(() => Connection.handleDbServerError(response)).toThrow(ForeignKeyValidationError);
			});

			test('should throw a record locked error if the record locked error code is returned from the database', () => {
				const response = { data: { output: { errorCode: dbErrors.recordLocked.code } } };
				expect(() => Connection.handleDbServerError(response)).toThrow(RecordLockedError);
			});

			test('should throw a record version error if the record version error code is returned from the database', () => {
				const response = { data: { output: { errorCode: dbErrors.recordVersion.code } } };
				expect(() => Connection.handleDbServerError(response)).toThrow(RecordVersionError);
			});

			test('should throw a db server error if the response output has an unknown error code', () => {
				const response = { data: { output: { errorCode: 1000 } } };
				expect(() => Connection.handleDbServerError(response)).toThrow(DbServerError);
			});

			test('should do nothing if a non numeric error code is returned', () => {
				const response = { data: { output: { errorCode: 'foo' } } };
				expect(() => Connection.handleDbServerError(response)).not.toThrow(DbServerError);
			});
		});
	});

	describe('constructor', () => {
		beforeAll(() => {
			stub(Connection, 'getServerProgramName').returnsArg(0);
		});

		afterAll(() => {
			Connection.getServerProgramName.restore();
		});

		test('should set instance variables based on constructor parameters', () => {
			expect(
				new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
					cacheMaxAge: 'baz',
					timeout: 'qux',
				}),
			).toMatchObject({
				_endpoint: 'foo/bar/subroutine/entry',
				logger: mockLogger,
				status: CONNECTION_STATUS.DISCONNECTED,
				_cacheMaxAge: 'baz',
				_timeout: 'qux',
			});
		});
	});

	describe('instance methods', () => {
		// stub static method used by constructor
		beforeAll(() => {
			stub(Connection, 'getServerProgramName').returnsArg(0);
		});

		afterAll(() => {
			Connection.getServerProgramName.restore();
		});

		describe('open', () => {
			let connection;

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				stub(connection, '_getFeatureState').resolves();
				stub(connection, '_getDbServerInfo').resolves();
			});

			beforeEach(() => {
				connection._serverFeatureSet = {};
			});

			test('should resolve if nothing invalid is found', async () => {
				connection._serverFeatureSet = { invalidFeatures: [] };
				expect(await connection.open()).toBeUndefined();
			});

			test('should change state to CONNECTED if nothing invalid is found', async () => {
				connection._serverFeatureSet = { invalidFeatures: [] };
				await connection.open();
				expect(connection.status).toBe(CONNECTION_STATUS.CONNECTED);
			});

			test('should reject if something invalid is found', async () => {
				connection._serverFeatureSet = { invalidFeatures: ['foo'] };
				await expect(connection.open()).rejects.toThrow();
			});

			test('should leave state as DISCONNECTED if something invalid is found', async () => {
				connection._serverFeatureSet = { invalidFeatures: ['foo'] };
				try {
					// will throw when invalid features are found
					await connection.open();
				} catch (err) {
					// ignore
				}
				expect(connection.status).toBe(CONNECTION_STATUS.DISCONNECTED);
			});
		});

		describe('deployFeatures', () => {
			let connection;
			let executeDb;
			let getFeatureState;

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				stub(connection, 'executeDbFeature').resolves();
				executeDb = stub(connection, '_executeDb').resolves();
				getFeatureState = stub(connection, '_getFeatureState');
				stub(Connection, 'getUnibasicSource').resolves('foo');
			});

			afterAll(() => {
				Connection.getUnibasicSource.restore();
			});

			beforeEach(() => {
				executeDb.resetHistory();
				getFeatureState.reset();
			});

			/* eslint-disable func-names */
			test('should reject if sourceDir is not provided', async () => {
				await expect(connection.deployFeatures()).rejects.toThrow();
			});

			test('should resolve if all features are already present', async () => {
				getFeatureState.callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: [],
					};
				});
				expect(await connection.deployFeatures('foo')).toBeUndefined();
			});

			test('should create directory if the option is specified', async () => {
				getFeatureState.callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: ['foo'],
					};
				});
				await connection.deployFeatures('foo', { createDir: true });
				expect(
					executeDb.calledWith({
						action: 'createDir',
						dirName: 'foo',
					}),
				).toBe(true);
			});

			test('should resolve if the deploy feature is successfully deployed', async () => {
				getFeatureState.onCall(0).callsFake(function () {
					this._serverFeatureSet = { validFeatures: {}, invalidFeatures: ['deploy'] };
				});
				getFeatureState.onCall(1).callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: [],
					};
				});
				expect(await connection.deployFeatures('foo')).toBeUndefined();
			});

			test('should resolve if the setup feature is successfully deployed', async () => {
				getFeatureState.onCall(0).callsFake(function () {
					this._serverFeatureSet = { validFeatures: {}, invalidFeatures: ['setup'] };
				});
				getFeatureState.onCall(1).callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: [],
					};
				});
				expect(await connection.deployFeatures('foo')).toBeUndefined();
			});

			test('should resolve if the teardown feature is successfully deployed', async () => {
				getFeatureState.onCall(0).callsFake(function () {
					this._serverFeatureSet = { validFeatures: {}, invalidFeatures: ['teardown'] };
				});
				getFeatureState.onCall(1).callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: [],
					};
				});
				expect(await connection.deployFeatures('foo')).toBeUndefined();
			});

			test('should resolve if missing features are successfully deployed', async () => {
				getFeatureState.callsFake(function () {
					this._serverFeatureSet = {
						validFeatures: { deploy: '1.0.0', setup: '1.0.0', teardown: '1.0.0' },
						invalidFeatures: [],
					};
				});
				expect(await connection.deployFeatures('foo')).toBeUndefined();
			});
			/* eslint-enable func-names */
		});

		describe('executeDbFeature', () => {
			let connection;
			let executeDb;

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				executeDb = stub(connection, '_executeDb').resolves();
			});

			test('should call executeDb with the subroutine data format', async () => {
				await connection.executeDbFeature('foo', 'bar', 'baz', 'qux');
				expect(
					executeDb.calledWith({
						action: 'subroutine',
						subroutineId: 'foo',
						setupId: 'setup',
						teardownId: 'teardown',
						options: 'bar',
						setupOptions: 'baz',
						teardownOptions: 'qux',
					}),
				).toBe(true);
			});

			test('should call executeDb with empty options objects', async () => {
				await connection.executeDbFeature('foo');
				expect(
					executeDb.calledWith({
						action: 'subroutine',
						subroutineId: 'foo',
						setupId: 'setup',
						teardownId: 'teardown',
						options: {},
						setupOptions: {},
						teardownOptions: {},
					}),
				).toBe(true);
			});
		});

		describe('date/time methods', () => {
			let connection;
			let _getDbServerInfo;

			const add = stub().returnsThis();
			const format = stub().returnsThis();
			const moment = stub().returns({ add, format });

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				_getDbServerInfo = stub(connection, '_getDbServerInfo').resolves();

				connection._timeDrift = 'timeDriftValue';

				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				_getDbServerInfo.resetHistory();
				add.resetHistory();
				format.resetHistory();
			});

			describe('getDbDate', () => {
				test('should call _getDbServerInfo', async () => {
					await connection.getDbDate();
					expect(_getDbServerInfo.calledOnce).toBe(true);
				});

				test('should call moment.add/format', async () => {
					await connection.getDbDate();
					expect(add.calledOnce).toBe(true);
					expect(add.calledWith(connection._timeDrift)).toBe(true);
					expect(format.calledOnce).toBe(true);
					expect(format.calledWith(ISOCalendarDateFormat)).toBe(true);
				});
			});

			describe('getDbDateTime', () => {
				test('should call _getDbServerInfo', async () => {
					await connection.getDbDateTime();
					expect(_getDbServerInfo.calledOnce).toBe(true);
				});

				test('should call moment.add/format', async () => {
					await connection.getDbDateTime();
					expect(add.calledOnce).toBe(true);
					expect(add.calledWith(connection._timeDrift)).toBe(true);
					expect(format.calledOnce).toBe(true);
					expect(format.calledWith(ISOCalendarDateTimeFormat)).toBe(true);
				});
			});

			describe('getDbTime', () => {
				test('should call _getDbServerInfo', async () => {
					await connection.getDbTime();
					expect(_getDbServerInfo.calledOnce).toBe(true);
				});

				test('should call moment.add/format', async () => {
					await connection.getDbTime();
					expect(add.calledOnce).toBe(true);
					expect(add.calledWith(connection._timeDrift)).toBe(true);
					expect(format.calledOnce).toBe(true);
					expect(format.calledWith(ISOTimeFormat)).toBe(true);
				});
			});
		});

		describe('model', () => {
			let connection;
			const compileModel = stub().returns('compileModelResult');
			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});

				RewireAPI.__Rewire__('compileModel', compileModel);
			});

			beforeEach(() => {
				connection.status = CONNECTION_STATUS.DISCONNECTED;
				compileModel.resetHistory();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('compileModel');
			});

			test('should throw Error if connection has not been opened', () => {
				expect(() => {
					connection.model();
				}).toThrow();
			});

			test('should return the result from compileModel', () => {
				connection.status = CONNECTION_STATUS.CONNECTED;
				expect(connection.model()).toBe('compileModelResult');
			});

			test('should call compileModel with the expected parameters', () => {
				connection.status = CONNECTION_STATUS.CONNECTED;
				connection.model('foo', 'bar');
				expect(compileModel.calledWith(connection, 'foo', 'bar')).toBe(true);
			});
		});

		describe('_executeDb', () => {
			let connection;

			const post = stub();
			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
					timeout: 'baz',
				});
				RewireAPI.__Rewire__('axios', { post });
				RewireAPI.__Rewire__('handleDbServerError', stub());
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('axios');
				RewireAPI.__ResetDependency__('handleDbServerError');
			});

			beforeEach(() => {
				post.reset();
			});

			test('should reject with InvalidParameterError if data parameter is null or undefined', async () => {
				await expect(connection._executeDb()).rejects.toThrow(InvalidParameterError);
			});

			test('should reject with InvalidParameterError if action property of data parameter is null or undefined', async () => {
				await expect(connection._executeDb({})).rejects.toThrow(InvalidParameterError);
			});

			test('should reject with ConnectionManagerError if post rejects', async () => {
				post.rejects();
				await expect(connection._executeDb({ action: 'foo' })).rejects.toThrow(
					ConnectionManagerError,
				);
			});

			test('should return the data.output property', async () => {
				post.resolves({ data: { output: 'bar' } });
				expect(await connection._executeDb({ action: 'foo' })).toBe('bar');
			});

			describe('request parameters', () => {
				const data = { action: 'foo' };
				beforeEach(() => {
					post.resolves({ data: { output: 'bar' } });
				});

				test('should post call axios.post', async () => {
					await connection._executeDb(data);
					expect(post.calledOnce).toBe(true);
				});

				test('should post to the defined endpoint', async () => {
					await connection._executeDb(data);
					const expected = connection._endpoint;
					expect(post.args[0][0]).toBe(expected);
				});

				test('should post with the provided data', async () => {
					await connection._executeDb(data);
					const expected = { input: data };
					expect(post.args[0][1]).toEqual(expected);
				});

				test('should post with the timeout option', async () => {
					await connection._executeDb(data);
					const expected = connection._timeout;
					expect(post.args[0][2].timeout).toBe(expected);
				});
			});
		});

		describe('_getDbServerInfo', () => {
			let connection;

			const serverInfo = {
				date: 'dateInfo',
				time: 'timeInfo',
			};

			const add = stub().returnsThis();
			const diff = stub().returnsThis();
			const momentReturnVal = { add, diff };
			const moment = stub().returns(momentReturnVal);

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
					cacheMaxAge: 1,
				});

				stub(connection, 'executeDbFeature').resolves(serverInfo);

				RewireAPI.__Rewire__('moment', moment);
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('moment');
			});

			beforeEach(() => {
				moment.resetHistory();
				add.resetHistory();
				diff.resetHistory();
				connection._cacheExpiry = 0;
				connection._timeDrift = null;
			});

			test('should do nothing if cache expiry is in the future', async () => {
				connection._cacheExpiry = Date.now() + 10000;
				await connection._getDbServerInfo();
				expect(moment.notCalled).toBe(true);
				expect(add.notCalled).toBe(true);
				expect(diff.notCalled).toBe(true);
				expect(connection._timeDrift).toBeNull();
			});

			test('should call moment once with the mvEpoch and once without anything', async () => {
				await connection._getDbServerInfo();
				expect(moment.calledTwice).toBe(true);
				expect(moment.calledWith(mvEpoch)).toBe(true);
				expect(moment.calledWith()).toBe(true);
			});

			test('should call add with days and milliseconds', async () => {
				await connection._getDbServerInfo();
				expect(add.calledTwice).toBe(true);
				expect(add.calledWith('dateInfo', 'days')).toBe(true);
				expect(add.calledWith('timeInfo', 'ms')).toBe(true);
			});

			test('should call diff with the return val from moment invocation', async () => {
				await connection._getDbServerInfo();
				expect(diff.calledOnce).toBe(true);
				expect(diff.calledWith(momentReturnVal)).toBe(true);
			});

			describe('cache expiration', () => {
				let clock;
				beforeAll(() => {
					clock = useFakeTimers();
				});

				afterAll(() => {
					clock.restore();
				});

				test('should set the cache expiry based on the provided _cacheMaxAge', async () => {
					connection._cacheExpiry = -1;
					await connection._getDbServerInfo();
					expect(connection._cacheExpiry).toBe(1000);
				});
			});
		});

		describe('_getFeatureState', () => {
			let connection;
			let getServerFeatures;
			const maxSatisfying = stub();

			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				getServerFeatures = stub(connection, '_getServerFeatures');
				RewireAPI.__Rewire__('semver', { maxSatisfying });
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('semver');
				RewireAPI.__ResetDependency__('serverDependencies');
			});

			beforeEach(() => {
				maxSatisfying.reset();
				RewireAPI.__ResetDependency__('serverDependencies');
			});

			test('should set instance variable serverFeatureSet as valid if all conditions pass', async () => {
				RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
				getServerFeatures.resolves({ foo: '1.0.0' });
				maxSatisfying.returns('1.0.0');

				await connection._getFeatureState();
				expect(connection._serverFeatureSet).toEqual({
					validFeatures: { foo: '1.0.0' },
					invalidFeatures: [],
				});
			});

			test('should set instance variable serverFeatureSet as invalid if the server does not have the feature', async () => {
				RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
				getServerFeatures.resolves({});

				await connection._getFeatureState();
				expect(connection._serverFeatureSet).toEqual({
					validFeatures: {},
					invalidFeatures: ['foo'],
				});
			});

			test("should set instance variable serverFeatureSet as invalid if the server's feature version does not satisfy", async () => {
				RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
				getServerFeatures.resolves({ foo: '2.0.0' });
				maxSatisfying.returns(null);

				await connection._getFeatureState();
				expect(connection._serverFeatureSet).toEqual({
					validFeatures: {},
					invalidFeatures: ['foo'],
				});
			});
		});

		describe('_getServerFeatures', () => {
			let connection;
			let executeDb;

			const valid = stub();
			beforeAll(() => {
				connection = new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				});
				executeDb = stub(connection, '_executeDb');
				RewireAPI.__Rewire__('semver', { valid });
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('semver');
			});

			beforeEach(() => {
				executeDb.reset();
				valid.reset();
			});

			test('should return an empty object if no features are returned', async () => {
				executeDb.resolves({});
				expect(await connection._getServerFeatures()).toEqual({});
			});

			test("should not return a feature which doesn't satisfy the feature regex pattern", async () => {
				executeDb.resolves({ features: ['foo'] });
				expect(await connection._getServerFeatures()).toEqual({});
			});

			test('should not return a feature which does not contain a valid semver', async () => {
				executeDb.resolves({ features: ['mvom_foo@1.0.0'] });
				valid.returns(false);
				expect(await connection._getServerFeatures()).toEqual({});
			});

			test('should return a feature which has a valid structure', async () => {
				executeDb.resolves({ features: ['mvom_foo@1.0.0'] });
				valid.returns(true);
				expect(await connection._getServerFeatures()).toEqual({ foo: ['1.0.0'] });
			});

			test('should handle multiple valid versions of the same feature', async () => {
				executeDb.resolves({ features: ['mvom_foo@1.0.0', 'mvom_foo@2.0.0'] });
				valid.returns(true);
				expect(await connection._getServerFeatures()).toEqual({ foo: ['1.0.0', '2.0.0'] });
			});
		});
	});
});
