import { assert } from 'chai';
import RecordVersionError from './';

describe('RecordVersionError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new RecordVersionError();
			assert.strictEqual(error.name, 'RecordVersionError');
			assert.strictEqual(
				error.message,
				'Record has changed since it was read and cannot be updated',
			);
		});

		it('should override default message', () => {
			const error = new RecordVersionError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new RecordVersionError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
