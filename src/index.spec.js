import { assert } from 'chai';
import { stub } from 'sinon';
import mvom, { __RewireAPI__ as RewireAPI } from './';

describe('mvom', () => {
	describe('createConnection method', () => {
		const Connection = stub();
		const Logger = class {};

		before(() => {
			RewireAPI.__Rewire__('Connection', Connection);
			RewireAPI.__Rewire__('winston', { Logger, transports: { Console: class {} } });
		});

		after(() => {
			RewireAPI.__ResetDependency__('Connection');
			RewireAPI.__ResetDependency__('winston');
		});

		it('should reject if connectionManagerUri is not provided in parameters', () => {
			assert.throws(mvom.createConnection.bind(mvom, null, 'foo'));
		});

		it('should reject if account is not provided in options', () => {
			assert.throws(mvom.createConnection.bind(mvom, 'foo', null));
		});

		it('should return an instance of Connection object', () => {
			assert.instanceOf(mvom.createConnection('foo', 'bar'), Connection);
			assert.isTrue(
				Connection.calledWith({
					connectionManagerUri: 'foo',
					account: 'bar',
					logger: new Logger(),
				}),
				'Connection constructor should be called with expected parameters',
			);
		});
	});
});
