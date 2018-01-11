import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import mvom, { __RewireAPI__ as RewireAPI } from './';

describe('mvom', () => {
	before(() => {
		chai.use(chaiAsPromised);
	});

	describe('connect method', () => {
		const deployFeatures = stub().resolves();
		const getFeatureState = stub();

		before(() => {
			RewireAPI.__Rewire__('Connection', class {});
			RewireAPI.__Rewire__('getServerProgramName', stub().returnsArg(0));
			RewireAPI.__Rewire__('deployFeatures', deployFeatures);
			RewireAPI.__Rewire__('getFeatureState', getFeatureState);
		});

		after(() => {
			RewireAPI.__ResetDependency__('Connection');
			RewireAPI.__ResetDependency__('getServerProgramName');
			RewireAPI.__ResetDependency__('deployFeatures');
			RewireAPI.__ResetDependency__('getFeatureState');
		});

		beforeEach(() => {
			deployFeatures.resetHistory();
			getFeatureState.reset();
		});

		it('should reject if account is not provided in options', () =>
			assert.isRejected(mvom.connect('foo', { sourceDir: 'bar' })));

		it('should reject if sourceDir is not provided in options', () =>
			assert.isRejected(mvom.connect('foo', { account: 'bar' })));

		it('should call deployFeatures if getFeatureState returns anything invalid', async () => {
			getFeatureState.resolves({ invalidFeatures: ['foo'] });
			await mvom.connect('foo', { account: 'bar', sourceDir: 'baz' });
			assert.isTrue(deployFeatures.calledOnce);
		});

		it("should not call deployFeatures if getFeatureState doesn't return anything invalid", async () => {
			getFeatureState.resolves({ invalidFeatures: [] });
			await mvom.connect('foo', { account: 'bar', sourceDir: 'baz' });
			assert.isTrue(deployFeatures.notCalled);
		});
	});
});
