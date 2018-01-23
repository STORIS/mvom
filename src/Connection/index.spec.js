/* eslint-disable no-underscore-dangle */
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import mockLogger from 'testHelpers/mockLogger';
import Connection, { __RewireAPI__ as RewireAPI } from './';

describe('Connection', () => {
	before(() => {
		chai.use(chaiAsPromised);
	});

	describe('constructor', () => {
		before(() => {
			RewireAPI.__Rewire__('getServerProgramName', stub().returnsArg(0));
		});

		after(() => {
			RewireAPI.__ResetDependency__('getServerProgramName');
		});

		it('should set instance variables based on constructor parameters', () => {
			assert.include(
				new Connection({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: mockLogger,
				}),
				{
					endpoint: 'foo/bar/subroutine/entry',
					logger: mockLogger,
				},
			);
		});
	});

	describe('open method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});
		stub(connection, '_getFeatureState').resolves();

		beforeEach(() => {
			connection.serverFeatureSet = {};
		});

		it('should resolve if nothing invalid is found', () => {
			connection.serverFeatureSet = { invalidFeatures: [] };
			return assert.isFulfilled(connection.open());
		});

		it('should reject if something invalid is found', () => {
			connection.serverFeatureSet = { invalidFeatures: ['foo'] };
			return assert.isRejected(connection.open());
		});
	});

	describe('deployFeatures method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});
		stub(connection, 'executeDbFeature').resolves();
		const executeDb = stub(connection, '_executeDb').resolves();
		const getFeatureState = stub(connection, '_getFeatureState');

		before(() => {
			chai.use(chaiAsPromised);
			RewireAPI.__Rewire__('getServerProgramName', stub().returnsArg(0));
			RewireAPI.__Rewire__('getUnibasicSource', stub().resolves('foo'));
		});

		after(() => {
			RewireAPI.__ResetDependency__('getServerProgramName');
			RewireAPI.__ResetDependency__('getUnibasicSource');
		});

		beforeEach(() => {
			executeDb.resetHistory();
			getFeatureState.reset();
		});

		/* eslint-disable func-names */
		it('should reject if sourceDir is not provided', () =>
			assert.isRejected(connection.deployFeatures()));

		it('should resolve if all features are already present', () => {
			getFeatureState.callsFake(function() {
				this.serverFeatureSet = { validFeatures: { deploy: '1.0.0' }, invalidFeatures: [] };
			});
			return assert.isFulfilled(connection.deployFeatures('foo'));
		});

		it('should create directory if the option is specified', async () => {
			getFeatureState.callsFake(function() {
				this.serverFeatureSet = { validFeatures: { deploy: '1.0.0' }, invalidFeatures: ['foo'] };
			});
			await connection.deployFeatures('foo', { createDir: true });
			assert.isTrue(
				executeDb.calledWith({
					action: 'createDir',
					dirName: 'foo',
				}),
			);
		});

		it('should resolve if the deploy feature is successfully deployed', () => {
			getFeatureState.onCall(0).callsFake(function() {
				this.serverFeatureSet = { validFeatures: {}, invalidFeatures: ['deploy'] };
			});
			getFeatureState.onCall(1).callsFake(function() {
				this.serverFeatureSet = { validFeatures: { deploy: '1.0.0' }, invalidFeatures: [] };
			});
			return assert.isFulfilled(connection.deployFeatures('foo'));
		});

		it('should resolve if missing features are successfully deployed', () => {
			getFeatureState.callsFake(function() {
				this.serverFeatureSet = { validFeatures: { deploy: '1.0.0' }, invalidFeatures: ['foo'] };
			});
			return assert.isFulfilled(connection.deployFeatures('foo'));
		});
		/* eslint-enable func-names */
	});

	describe('_getFeatureState method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});
		const getServerFeatures = stub(connection, '_getServerFeatures');
		const maxSatisfying = stub();

		before(() => {
			RewireAPI.__Rewire__('semver', { maxSatisfying });
		});

		after(() => {
			RewireAPI.__ResetDependency__('semver');
			RewireAPI.__ResetDependency__('serverDependencies');
		});

		beforeEach(() => {
			maxSatisfying.reset();
			RewireAPI.__ResetDependency__('serverDependencies');
		});

		it('should set instance variable serverFeatureSet as valid if all conditions pass', async () => {
			RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
			getServerFeatures.resolves({ foo: '1.0.0' });
			maxSatisfying.returns('1.0.0');

			await connection._getFeatureState();
			assert.deepEqual(connection.serverFeatureSet, {
				validFeatures: { foo: '1.0.0' },
				invalidFeatures: [],
			});
		});

		it('should set instance variable serverFeatureSet as invalid if the server does not have the feature', async () => {
			RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
			getServerFeatures.resolves({});

			await connection._getFeatureState();
			assert.deepEqual(connection.serverFeatureSet, {
				validFeatures: {},
				invalidFeatures: ['foo'],
			});
		});

		it("should set instance variable serverFeatureSet as invalid if the server's feature version does not satisfy", async () => {
			RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
			getServerFeatures.resolves({ foo: '2.0.0' });
			maxSatisfying.returns(null);

			await connection._getFeatureState();
			assert.deepEqual(connection.serverFeatureSet, {
				validFeatures: {},
				invalidFeatures: ['foo'],
			});
		});
	});

	describe('executeDbFeature method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});

		const executeDb = stub(connection, '_executeDb').resolves();

		before(() => {
			RewireAPI.__Rewire__('getServerProgramName', stub().returnsArg(0));
		});

		after(() => {
			RewireAPI.__ResetDependency__('getServerProgramName');
		});

		it('should call executeDb with the subroutine data format', async () => {
			await connection.executeDbFeature('foo', 'bar');
			assert.isTrue(
				executeDb.calledWith({ action: 'subroutine', subroutineId: 'foo', options: 'bar' }),
			);
		});
	});

	describe('_executeDb method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});

		const post = stub();
		before(() => {
			RewireAPI.__Rewire__('axios', { post });
		});

		after(() => {
			RewireAPI.__ResetDependency__('axios');
		});

		beforeEach(() => {
			post.reset();
		});

		it('should reject if data parameter is null or undefined', () =>
			assert.isRejected(connection._executeDb()));

		it('should reject if action property of data parameter is null or undefined', () =>
			assert.isRejected(connection._executeDb({})));

		it('should reject if response is falsy', () => {
			post.resolves(null);
			return assert.isRejected(connection._executeDb({ action: 'foo' }));
		});

		it('should reject if response has falsy data', () => {
			post.resolves({});
			return assert.isRejected(connection._executeDb({ action: 'foo' }));
		});

		it('should reject if response has falsy data.output', () => {
			post.resolves({ data: {} });
			return assert.isRejected(connection._executeDb({ action: 'foo' }));
		});

		it('should reject if response has a truthy errorCode', () => {
			post.resolves({ data: { output: { errorCode: 1 } } });
			return assert.isRejected(connection._executeDb({ action: 'foo' }));
		});

		it('should return the data.output property', () => {
			post.resolves({ data: { output: 'bar' } });
			return assert.eventually.strictEqual(connection._executeDb({ action: 'foo' }), 'bar');
		});
	});

	describe('_getServerFeatures method', () => {
		const connection = new Connection({
			connectionManagerUri: 'foo',
			account: 'bar',
			logger: mockLogger,
		});
		const executeDb = stub(connection, '_executeDb');

		const valid = stub();
		before(() => {
			RewireAPI.__Rewire__('semver', { valid });
		});

		after(() => {
			RewireAPI.__ResetDependency__('semver');
		});

		beforeEach(() => {
			executeDb.reset();
			valid.reset();
		});

		it('should return an empty object if no features are returned', () => {
			executeDb.resolves({});
			return assert.eventually.deepEqual(connection._getServerFeatures(), {});
		});

		it("should not return a feature which doesn't satisfy the feature regex pattern", () => {
			executeDb.resolves({ features: ['foo'] });
			return assert.eventually.deepEqual(connection._getServerFeatures(), {});
		});

		it('should not return a feature which does not contain a valid semver', () => {
			executeDb.resolves({ features: ['mvom_foo@1.0.0'] });
			valid.returns(false);
			return assert.eventually.deepEqual(connection._getServerFeatures(), {});
		});

		it('should return a feature which has a valid structure', () => {
			executeDb.resolves({ features: ['mvom_foo@1.0.0'] });
			valid.returns(true);
			return assert.eventually.deepEqual(connection._getServerFeatures(), {
				foo: ['1.0.0'],
			});
		});

		it('should handle multiple valid versions of the same feature', () => {
			executeDb.resolves({ features: ['mvom_foo@1.0.0', 'mvom_foo@2.0.0'] });
			valid.returns(true);
			return assert.eventually.deepEqual(connection._getServerFeatures(), {
				foo: ['1.0.0', '2.0.0'],
			});
		});
	});
});
