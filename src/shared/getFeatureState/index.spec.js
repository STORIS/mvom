import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import getFeatureState, { __RewireAPI__ as RewireAPI } from './';

describe('getFeatureState', () => {
	const maxSatisfying = stub();
	const getServerFeatureSet = stub();

	before(() => {
		chai.use(chaiAsPromised);
		RewireAPI.__Rewire__('semver', { maxSatisfying });
		RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0', bar: '^2.0.0', baz: '^3.0.0' });
		RewireAPI.__Rewire__('getServerFeatureSet', getServerFeatureSet);
	});

	after(() => {
		RewireAPI.__ResetDependency__('semver');
		RewireAPI.__ResetDependency__('serverDependencies');
		RewireAPI.__ResetDependency__('getServerFeatureSet');
	});

	beforeEach(() => {
		maxSatisfying.reset();
		RewireAPI.__ResetDependency__('serverDependencies');
	});

	it('should return as a valid feature if all conditions pass', () => {
		RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
		getServerFeatureSet.resolves({ foo: '1.0.0' });
		maxSatisfying.returns('1.0.0');
		assert.eventually.deepEqual(getFeatureState('foo', 'bar'), {
			validFeatures: { foo: '1.0.0' },
			invalidFeatures: [],
		});
	});

	it('should return as an invalid feature if the server does not have the feature', () => {
		RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
		getServerFeatureSet.resolves({});
		return assert.eventually.deepEqual(getFeatureState('foo', 'bar'), {
			validFeatures: {},
			invalidFeatures: ['foo'],
		});
	});

	it("should return as an invalid feature if the server's feature version does not satisfy", async () => {
		RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0' });
		getServerFeatureSet.resolves({ foo: '2.0.0' });
		maxSatisfying.returns(null);
		return assert.eventually.deepEqual(getFeatureState('foo', 'bar'), {
			validFeatures: {},
			invalidFeatures: ['foo'],
		});
	});
});
