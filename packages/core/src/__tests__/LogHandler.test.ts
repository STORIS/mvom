import LogHandler from '../LogHandler';

const loggerMock = {
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn(),
	verbose: jest.fn(),
	debug: jest.fn(),
	silly: jest.fn(),
};

const account = 'accountName';
const message = 'test message';

describe('error', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.error(message);

		expect(loggerMock.error).not.toHaveBeenCalled();
	});

	test('should emit log at error level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.error(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.error).toHaveBeenCalledWith(expected);
	});
});

describe('warn', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.warn(message);

		expect(loggerMock.warn).not.toHaveBeenCalled();
	});

	test('should emit log at warn level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.warn(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.warn).toHaveBeenCalledWith(expected);
	});
});

describe('info', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.info(message);

		expect(loggerMock.info).not.toHaveBeenCalled();
	});

	test('should emit log at info level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.info(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.info).toHaveBeenCalledWith(expected);
	});
});

describe('verbose', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.verbose(message);

		expect(loggerMock.verbose).not.toHaveBeenCalled();
	});

	test('should emit log at verbose level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.verbose(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.verbose).toHaveBeenCalledWith(expected);
	});
});

describe('debug', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.debug(message);

		expect(loggerMock.debug).not.toHaveBeenCalled();
	});

	test('should emit log at debug level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.debug(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.debug).toHaveBeenCalledWith(expected);
	});
});

describe('silly', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.silly(message);

		expect(loggerMock.silly).not.toHaveBeenCalled();
	});

	test('should emit log at silly level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.silly(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.silly).toHaveBeenCalledWith(expected);
	});
});
