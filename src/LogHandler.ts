type LogFunction = (message: string) => void;

export interface Logger {
	fatal: LogFunction;
	error: LogFunction;
	warn: LogFunction;
	info: LogFunction;
	debug: LogFunction;
	trace: LogFunction;
}

/** Handle logging */
class LogHandler implements Logger {
	private account: string;

	private logger?: Logger;

	public constructor(account: string, logger?: Logger) {
		this.account = account;
		this.logger = logger;
	}

	/** Emit a fatal level log */
	public fatal(message: string): void {
		return this.log('fatal', message);
	}

	/** Emit an error level log */
	public error(message: string): void {
		return this.log('error', message);
	}

	/** Emit a warn level log */
	public warn(message: string): void {
		return this.log('warn', message);
	}

	/** Emit an info level log */
	public info(message: string): void {
		return this.log('info', message);
	}

	/** Emit a debug level log */
	public debug(message: string): void {
		return this.log('debug', message);
	}

	/** Emit a trace level log */
	public trace(message: string): void {
		return this.log('trace', message);
	}

	/** Log a message to logger */
	private log(level: keyof Logger, message: string): void {
		if (this.logger == null) {
			return;
		}

		const formattedMessage = this.formatMessage(message);

		this.logger[level](formattedMessage);
	}

	/** Format message including account */
	private formatMessage(message: string): string {
		return `[${this.account}] ${message}`;
	}
}

export default LogHandler;
