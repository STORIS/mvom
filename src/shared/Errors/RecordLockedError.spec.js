import RecordLockedError from './RecordLockedError';

describe('RecordLockedError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new RecordLockedError();
			expect(error.name).toBe('RecordLockedError');
			expect(error.message).toBe('Record is locked and cannot be updated');
		});

		test('should override default message', () => {
			const error = new RecordLockedError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new RecordLockedError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
