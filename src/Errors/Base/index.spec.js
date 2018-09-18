import { assert } from 'chai';
import BaseError, { __RewireAPI__ as RewireAPI } from './';

describe('BaseError', () => {
	const DisallowDirectError = class extends Error {};
	let Extension;
	before(() => {
		RewireAPI.__Rewire__('DisallowDirectError', DisallowDirectError);
		Extension = class extends BaseError {};
	});

	after(() => {
		RewireAPI.__ResetDependency__('DisallowDirectError');
	});

	describe('constructor', () => {
		it('should throw if directly instantiated', () => {
			assert.throws(() => new BaseError(), DisallowDirectError);
		});

		it('should set instance members with default values', () => {
			const error = new Extension();
			assert.strictEqual(error.source, 'mvom');
			assert.strictEqual(error.name, 'BaseError');
			assert.strictEqual(error.message, 'Base Error');
		});

		it('should override default message', () => {
			const error = new Extension({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default name', () => {
			const error = new Extension({ name: 'foo' });
			assert.strictEqual(error.name, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new Extension({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
