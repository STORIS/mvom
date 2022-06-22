import type { Logger } from './types';

/** Handle logging */
class LogHandler {
	private account: string;

	private logger?: Logger;

	public constructor(account: string, logger?: Logger) {
		this.account = account;
		this.logger = logger;
	}

	/** Log a message to logger including account name */
	public log(level: keyof Logger, message: string): void {
		if (this.logger == null) {
			return;
		}

		const formattedMessage = `[${this.account}] ${message}`;

		this.logger[level](formattedMessage);
	}
}

export default LogHandler;
