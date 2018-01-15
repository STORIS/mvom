import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import getUnibasicSource, { __RewireAPI__ as RewireAPI } from './';

describe('getUnibasicSource', () => {
	const readFile = stub().resolves('foo');
	before(() => {
		chai.use(chaiAsPromised);
		RewireAPI.__Rewire__('fs', { readFile });
		RewireAPI.__Rewire__('path', { join: stub().returns('bar') });
	});

	after(() => {
		RewireAPI.__ResetDependency__('fs');
		RewireAPI.__ResetDependency__('path');
	});

	beforeEach(() => {
		readFile.resetHistory();
	});

	it('should call readFile with the output from path.join()', async () => {
		await getUnibasicSource('baz');
		assert.isTrue(readFile.calledWith('bar', 'utf8'));
	});

	it('should return the result of fs.readFile()', () =>
		assert.eventually.strictEqual(getUnibasicSource('baz'), 'foo'));
});
