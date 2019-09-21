import RecordVersionError from './RecordVersionError';

describe('RecordVersionError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new RecordVersionError();
			expect(error.name).toBe('RecordVersionError');
			expect(error.message).toBe('Record has changed since it was read and cannot be updated');
		});

		test('should override default message', () => {
			const error = new RecordVersionError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new RecordVersionError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
