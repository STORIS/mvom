import dummyLogger from './dummyLogger';

describe('dummyLogger', () => {
	test('error', () => {
		expect(typeof dummyLogger.error).toBe('function');
		expect(dummyLogger.error()).toBeUndefined();
	});

	test('warn', () => {
		expect(typeof dummyLogger.warn).toBe('function');
		expect(dummyLogger.warn()).toBeUndefined();
	});

	test('info', () => {
		expect(typeof dummyLogger.info).toBe('function');
		expect(dummyLogger.info()).toBeUndefined();
	});

	test('verbose', () => {
		expect(typeof dummyLogger.verbose).toBe('function');
		expect(dummyLogger.verbose()).toBeUndefined();
	});

	test('debug', () => {
		expect(typeof dummyLogger.debug).toBe('function');
		expect(dummyLogger.debug()).toBeUndefined();
	});

	test('silly', () => {
		expect(typeof dummyLogger.silly).toBe('function');
		expect(dummyLogger.silly()).toBeUndefined();
	});
});
