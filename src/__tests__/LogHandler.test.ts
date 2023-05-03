import LogHandler from '../LogHandler';

const loggerMock = {
	fatal: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	info: jest.fn(),
	debug: jest.fn(),
	trace: jest.fn(),
};

const account = 'accountName';
const message = 'test message';

describe('fatal', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.fatal(message);

		expect(loggerMock.fatal).not.toHaveBeenCalled();
	});

	test('should emit log at fatal level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.fatal(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.fatal).toHaveBeenCalledWith(expected);
	});
});

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

describe('trace', () => {
	test('should not emit log if no logger specified', () => {
		const logHandler = new LogHandler(account);
		logHandler.trace(message);

		expect(loggerMock.trace).not.toHaveBeenCalled();
	});

	test('should emit log at trace level', () => {
		const logHandler = new LogHandler(account, loggerMock);
		logHandler.trace(message);

		const expected = `[${account}] ${message}`;
		expect(loggerMock.trace).toHaveBeenCalledWith(expected);
	});
});
