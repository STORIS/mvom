import dummyLogger from './dummyLogger';

describe('dummyLogger', () => {
	test('error', () => {
		expect(typeof dummyLogger.error).toBe('function');
		expect(dummyLogger.error()).not.toBeDefined();
	});

	test('warn', () => {
		expect(typeof dummyLogger.warn).toBe('function');
		expect(dummyLogger.warn()).not.toBeDefined();
	});

	test('info', () => {
		expect(typeof dummyLogger.info).toBe('function');
		expect(dummyLogger.info()).not.toBeDefined();
	});

	test('verbose', () => {
		expect(typeof dummyLogger.verbose).toBe('function');
		expect(dummyLogger.verbose()).not.toBeDefined();
	});

	test('debug', () => {
		expect(typeof dummyLogger.debug).toBe('function');
		expect(dummyLogger.debug()).not.toBeDefined();
	});

	test('silly', () => {
		expect(typeof dummyLogger.silly).toBe('function');
		expect(dummyLogger.silly()).not.toBeDefined();
	});
});
