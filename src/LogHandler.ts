import type { Logger } from './types';

/** Handle logging */
class LogHandler {
	private account: string;

	private logger?: Logger;

	public constructor(account: string, logger?: Logger) {
		this.account = account;
		this.logger = logger;
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

	/** Emit a verbose level log */
	public verbose(message: string): void {
		return this.log('verbose', message);
	}

	/** Emit a debug level log */
	public debug(message: string): void {
		return this.log('debug', message);
	}

	/** Emit a silly level log */
	public silly(message: string): void {
		return this.log('silly', message);
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
