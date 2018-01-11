import { assert } from 'chai';
import getFeatureVersion, { __RewireAPI__ as RewireAPI } from './';

describe('getFeatureVersion', () => {
	before(() => {
		RewireAPI.__Rewire__('serverDependencies', { foo: '^1.0.0', bar: '^2.0.0-rc.1' });
	});

	after(() => {
		RewireAPI.__ResetDependency__('serverDependencies');
	});

	it('should return the version number from an unlabeled version', () => {
		assert.strictEqual(getFeatureVersion('foo'), '1.0.0');
	});

	it('should return the version number from a version with additional labels', () => {
		assert.strictEqual(getFeatureVersion('bar'), '2.0.0-rc.1');
	});
});
