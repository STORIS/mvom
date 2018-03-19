import { assert } from 'chai';
import InvalidServerFeaturesError from './';

describe('InvalidServerFeaturesError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new InvalidServerFeaturesError();
			assert.strictEqual(error.name, 'InvalidServerFeaturesError');
			assert.deepEqual(error.invalidFeatures, []);
			assert.strictEqual(error.message, 'Invalid feature set on db server');
		});

		it('should override default message', () => {
			const error = new InvalidServerFeaturesError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default invalidFeatures value', () => {
			const error = new InvalidServerFeaturesError({ invalidFeatures: 'foo' });
			assert.strictEqual(error.invalidFeatures, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new InvalidServerFeaturesError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
