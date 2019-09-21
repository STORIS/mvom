import ConnectionManagerError from './ConnectionManagerError';

describe('ConnectionManagerError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new ConnectionManagerError();
			expect(error.name).toBe('ConnectionManagerError');
			expect(error.connectionManagerRequest).toEqual({});
			expect(error.connectionManagerResponse).toEqual({});
			expect(error.message).toBe('Error in Connection Manager communication');
		});

		test('should override default message', () => {
			const error = new ConnectionManagerError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default connectionManagerRequest value', () => {
			const error = new ConnectionManagerError({ connectionManagerRequest: 'foo' });
			expect(error.connectionManagerRequest).toBe('foo');
		});

		test('should override default connectionManagerResponse value', () => {
			const error = new ConnectionManagerError({ connectionManagerResponse: 'foo' });
			expect(error.connectionManagerResponse).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new ConnectionManagerError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
