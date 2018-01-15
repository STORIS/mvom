import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import getServerFeatureSet, { __RewireAPI__ as RewireAPI } from './';

describe('getServerFeatureSet', () => {
	const post = stub();
	const valid = stub();

	before(() => {
		chai.use(chaiAsPromised);
		RewireAPI.__Rewire__('axios', { post });
		RewireAPI.__Rewire__('semver', { valid });
	});

	after(() => {
		RewireAPI.__ResetDependency__('axios');
		RewireAPI.__ResetDependency__('semver');
	});

	beforeEach(() => {
		post.reset();
		valid.reset();
	});

	it('should reject if the response has a truthy errorCode', () => {
		post.resolves({ data: { output: { errorCode: 1 } } });
		return assert.isRejected(getServerFeatureSet('foo', 'bar'));
	});

	it('should reject if the response is falsy', () => {
		post.resolves(null);
		return assert.isRejected(getServerFeatureSet('foo', 'bar'));
	});

	it('should reject if the response has falsy data', () => {
		post.resolves({});
		return assert.isRejected(getServerFeatureSet('foo', 'bar'));
	});

	it('should reject if the response has falsy data.output', () => {
		post.resolves({ data: {} });
		return assert.isRejected(getServerFeatureSet('foo', 'bar'));
	});

	it('should reject if the response has falsy data.output.programs', () => {
		post.resolves({ data: { output: {} } });
		return assert.isRejected(getServerFeatureSet('foo', 'bar'));
	});

	it("should not return a feature which doesn't satisfy the feature regex pattern", () => {
		post.resolves({ data: { output: { programs: ['foo'] } } });
		return assert.eventually.deepEqual(getServerFeatureSet('foo', 'bar'), {});
	});

	it('should not return a feature which does not contain a valid semver', () => {
		post.resolves({ data: { output: { programs: ['mvom_foo@1.0.0'] } } });
		valid.returns(false);
		return assert.eventually.deepEqual(getServerFeatureSet('foo', 'bar'), {});
	});

	it('should return a feature which has a valid structure', () => {
		post.resolves({ data: { output: { programs: ['mvom_foo@1.0.0'] } } });
		valid.returns(true);
		return assert.eventually.deepEqual(getServerFeatureSet('foo', 'bar'), { foo: ['1.0.0'] });
	});

	it('should handle multiple valid versions of the same feature', () => {
		post.resolves({ data: { output: { programs: ['mvom_foo@1.0.0', 'mvom_foo@2.0.0'] } } });
		valid.returns(true);
		return assert.eventually.deepEqual(getServerFeatureSet('foo', 'bar'), {
			foo: ['1.0.0', '2.0.0'],
		});
	});
});
