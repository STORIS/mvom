import Connection from 'Connection';
import winston from 'winston';

/** @module mvom */
class mvom {
	/**
	 * Create a new connection instance
	 * @static
	 * @param {string} connectionManagerUri - URI of the connection manager which faciliates access to the mv database
	 * @param {string} account - Database account that connection will be used against
	 * @param {Object} options
	 * @param {string} options.logLevel - Winston logging level (error, warn, info, verbose, debug, silly)
	 * @returns {Connection}
	 * @throws
	 */
	static createConnection = (connectionManagerUri, account, { logLevel = 'error' } = {}) => {
		if (connectionManagerUri == null || account == null) {
			throw new Error();
		}

		// initialize winston logging
		const logger = new winston.Logger({
			level: logLevel,
			transports: [
				new winston.transports.Console({
					colorize: true,
					label: account,
					timestamp: true,
				}),
			],
		});

		// do some stuff
		return new Connection({ connectionManagerUri, account, logger });
	};
}

export default mvom;
