import InvalidServerFeaturesError from './InvalidServerFeaturesError';

describe('InvalidServerFeaturesError', () => {
	describe('constructor', () => {
		test('should set instance members with default values', () => {
			const error = new InvalidServerFeaturesError();
			expect(error.name).toBe('InvalidServerFeaturesError');
			expect(error.invalidFeatures).toEqual([]);
			expect(error.message).toBe('Invalid feature set on db server');
		});

		test('should override default message', () => {
			const error = new InvalidServerFeaturesError({ message: 'foo' });
			expect(error.message).toBe('foo');
		});

		test('should override default invalidFeatures value', () => {
			const error = new InvalidServerFeaturesError({ invalidFeatures: 'foo' });
			expect(error.invalidFeatures).toBe('foo');
		});

		test('should destructure remaining properties into other property', () => {
			const error = new InvalidServerFeaturesError({ foo: 'bar' });
			expect(error.other).toEqual({ foo: 'bar' });
		});
	});
});
