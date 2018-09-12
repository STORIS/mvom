import { assert } from 'chai';
import RecordLockedError from './';

describe('RecordLockedError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new RecordLockedError();
			assert.strictEqual(error.name, 'RecordLockedError');
			assert.strictEqual(error.message, 'Record is locked and cannot be updated');
		});

		it('should override default message', () => {
			const error = new RecordLockedError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new RecordLockedError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
