import type { Logger } from '#shared/types';
import dummyLogger from '../dummyLogger';

test('should return void for all expected log levels', () => {
	const logLevels: (keyof Logger)[] = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

	logLevels.forEach((level) => {
		expect(dummyLogger[level]('message')).toBeUndefined();
	});
});
