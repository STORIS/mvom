import connectionStatus from './connectionStatusConstants';

describe('connectionStatus', () => {
	test('should export an object', () => {
		expect(typeof connectionStatus).toBe('object');
	});

	test('each property should be a string', () => {
		Object.values(connectionStatus).forEach(val => {
			expect(typeof val).toBe('string');
		});
	});
});
