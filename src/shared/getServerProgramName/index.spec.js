import { assert } from 'chai';
import { stub } from 'sinon';
import getServerProgramName, { __RewireAPI__ as RewireAPI } from './';

describe('getServerProgramName', () => {
	before(() => {
		RewireAPI.__Rewire__('getFeatureVersion', stub().returns('garply'));
	});

	after(() => {
		RewireAPI.__ResetDependency__('getFeatureVersion');
	});

	it('should return a formatted program name using passed version', () => {
		assert.strictEqual(getServerProgramName('foo', { version: 'bar' }), 'mvom_foo@bar');
	});

	it('should return a formatted program name using version returned from getFeatureVersion', () => {
		assert.strictEqual(getServerProgramName('foo'), 'mvom_foo@garply');
	});
});
