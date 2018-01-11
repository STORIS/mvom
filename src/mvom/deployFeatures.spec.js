import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import deployFeatures, { __RewireAPI__ as RewireAPI } from './deployFeatures';

describe('deployFeatures', () => {
	const post = stub();

	before(() => {
		chai.use(chaiAsPromised);
		RewireAPI.__Rewire__('axios', { post });
		RewireAPI.__Rewire__('getServerProgramName', stub().returnsArg(0));
		RewireAPI.__Rewire__('deploy', 'foo');
	});

	after(() => {
		RewireAPI.__ResetDependency__('axios');
		RewireAPI.__ResetDependency__('getServerProgramName');
		RewireAPI.__ResetDependency__('deploy');
	});

	beforeEach(() => {
		post.reset();
	});

	it('should resolve if the deploy feature is already present', () => {
		const serverFeatureSet = { validFeatures: { deploy: '1.0.0' } };
		return assert.isFulfilled(deployFeatures('foo', 'bar', serverFeatureSet));
	});

	it('should reject if the response has a truthy errorCode', () => {
		const serverFeatureSet = { validFeatures: {} };
		post.resolves({ data: { errorCode: 1 } });
		return assert.isRejected(deployFeatures('foo', 'bar', serverFeatureSet));
	});

	it('should reject if the response is falsy', () => {
		const serverFeatureSet = { validFeatures: {} };
		post.resolves(null);
		return assert.isRejected(deployFeatures('foo', 'bar', serverFeatureSet));
	});

	it('should reject if the response has falsy data', () => {
		const serverFeatureSet = { validFeatures: {} };
		post.resolves({});
		return assert.isRejected(deployFeatures('foo', 'bar', serverFeatureSet));
	});

	it('should reject if the response has falsy data.output', () => {
		const serverFeatureSet = { validFeatures: {} };
		post.resolves({ data: {} });
		return assert.isRejected(deployFeatures('foo', 'bar', serverFeatureSet));
	});

	it('should resolve if the feature successfully deploys', () => {
		const serverFeatureSet = { validFeatures: {} };
		post.resolves({ data: { output: {} } });
		return assert.isFulfilled(deployFeatures('foo', 'bar', serverFeatureSet));
	});
});
