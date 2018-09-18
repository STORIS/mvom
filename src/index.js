import Connection from 'Connection';
import Errors from 'Errors';
import Schema from 'Schema';
import InvalidParameterError from 'Errors/InvalidParameter';
import dummyLogger from 'utils/dummyLogger';

/**
 * Main mvom module
 * @module mvom
 */
const mvom = {
	/**
	 * @member {Errors} Errors
	 * @memberof mvom
	 */
	Errors,
	/**
	 * @member {Schema} Schema
	 * @memberof mvom
	 */
	Schema,
	/**
	 * Create a new connection instance
	 * @function createConnection
	 * @memberof mvom
	 * @param {string} connectionManagerUri - URI of the connection manager which faciliates access to the mv database
	 * @param {string} account - Database account that connection will be used against
	 * @param {Object} [options = {}]
	 * @param {Object} [options.logger] - Logger object used for emitting log messages. winston is recommended, but any object with methods conforming to the names of the standard npm log levels will work.
	 * @param {number} [options.cacheMaxAge=3600] - Maximum age, in seconds, of the cache of db server tier information
	 * @param {number} [options.timeout=0] - Request timeout, in milliseconds; defaults to no timeout
	 * @returns {Connection} Connection instance
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 */
	createConnection: (
		connectionManagerUri,
		account,
		{ logger = dummyLogger, cacheMaxAge = 3600, timeout = 0 } = {},
	) => {
		if (connectionManagerUri == null) {
			throw new InvalidParameterError({ parameterName: 'connectionManagerUri' });
		}
		if (account == null) {
			throw new InvalidParameterError({ parameterName: 'account' });
		}
		if (!Number.isInteger(cacheMaxAge)) {
			throw new InvalidParameterError({ parameterName: 'cacheMaxAge' });
		}

		if (!Number.isInteger(timeout)) {
			throw new InvalidParameterError({ parameterName: 'timeout' });
		}

		// do some stuff
		return new Connection({ connectionManagerUri, account, logger, cacheMaxAge, timeout });
	},
};

export default mvom;
export { Errors, Schema };
