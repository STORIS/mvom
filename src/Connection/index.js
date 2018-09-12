import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import semver from 'semver';
import compileModel from 'compileModel';
import ConnectionManagerError from 'Errors/ConnectionManager';
import InvalidParameterError from 'Errors/InvalidParameter';
import InvalidServerFeaturesError from 'Errors/InvalidServerFeatures';
import getFeatureVersion from 'shared/getFeatureVersion';
import connectionStatus from 'shared/constants/connectionStatus';
import {
	epoch,
	ISOCalendarDateFormat,
	ISOCalendarDateTimeFormat,
	ISOTimeFormat,
} from 'shared/constants/time';
import { dependencies as serverDependencies } from '.mvomrc.json';
import handleDbServerError from './handleDbServerError';

/** A connection object
 * @param {Object} options
 * @param {string} options.connectionManagerUri - URI of the connection manager which faciliates access to the mv database
 * @param {string} options.account - Database account that connection will be used against
 * @param options.logger - Logger instance used for diagnostic logging
 * @param {number} options.cacheMaxAge - Maximum age, in seconds, of the cache of db server tier information
 */
class Connection {
	/* static properties */
	/**
	 * File system path of the Unibasic source code
	 * @member {string} unibasicPath
	 * @memberof Connection
	 * @static
	 * @private
	 */
	static unibasicPath = path.resolve(path.join(__dirname, '../', 'unibasic'));

	/* static methods */
	/**
	 * Get the exact name of a program on the database server
	 * @function getServerProgramName
	 * @memberof Connection
	 * @static
	 * @private
	 * @param {string} feature - Feature name
	 * @param {Object} [options={}]
	 * @param {string} [options.version=PackagedVersion] - Version of feature to use
	 * @returns {string} Name of the database server program
	 */
	static getServerProgramName = (feature, options = {}) => {
		const version = options.version || getFeatureVersion(feature);
		return `mvom_${feature}@${version}`;
	};

	/**
	 * Get the UniBasic source code for a given feature
	 * @function getUnibasicSource
	 * @memberof Connection
	 * @static
	 * @private
	 * @async
	 * @param {string} feature - Feature name
	 * @returns {string} UniBasic source code
	 */
	static getUnibasicSource = async feature => {
		const filePath = path.join(Connection.unibasicPath, `${feature}.mvb`);
		return fs.readFile(filePath, 'utf8');
	};

	/* instance properties */
	/**
	 * Object providing the current state of db server features and availability
	 * @member {Object} _serverFeatureSet
	 * @memberof Connection
	 * @instance
	 * @private
	 * @property {Object} validFeatures - Key/value pairs of valid database server features and versions
	 * @property {string[]} invalidFeatures - List of invalid database server features
	 */
	_serverFeatureSet = { validFeatures: {}, invalidFeatures: [] };

	constructor({ connectionManagerUri, account, logger, cacheMaxAge }) {
		logger.debug(`creating new connection instance`);
		Object.defineProperties(this, {
			/**
			 * Logger instance used for diagnostic logging
			 * @member logger
			 * @memberof Connection
			 * @instance
			 */
			logger: {
				value: logger,
			},
			/**
			 * Connection status enumeration
			 * @member status
			 * @memberof Connection
			 * @instance
			 */
			status: {
				value: connectionStatus.DISCONNECTED,
				enumerable: true,
				writable: true,
			},
			/**
			 * Time that the connection information cache will expire
			 * @member _cacheExpiry
			 * @memberof Connection
			 * @instance
			 * @private
			 */
			_cacheExpiry: {
				value: 0,
				writable: true,
			},
			/**
			 * Maximum age of the cache before it must be refreshed
			 * @member _cacheMaxAge
			 * @memberof Connection
			 * @instance
			 * @private
			 */
			_cacheMaxAge: {
				value: cacheMaxAge,
			},
			/**
			 * URI of the full endpoint for communicating with the database
			 * @member {string} _endpoint
			 * @memberof Connection
			 * @instance
			 * @private
			 */
			_endpoint: {
				value: `${connectionManagerUri}/${account}/subroutine/${Connection.getServerProgramName(
					'entry',
				)}`,
			},
			/**
			 * +/- in milliseconds between database server time and local server time
			 * @member _timeDrift
			 * @memberof Connection
			 * @instance
			 * @private
			 */
			_timeDrift: {
				writable: true,
			},
		});
	}

	/* public instance methods */
	/**
	 * Open a database connection
	 * @function open
	 * @memberof Connection
	 * @instance
	 * @async
	 * @throws {InvalidServerFeaturesError} Invalid feature set found on db server
	 */
	open = async () => {
		this.logger.debug(`opening connection`);
		this.status = connectionStatus.CONNECTING;
		await this._getFeatureState();

		if (this._serverFeatureSet.invalidFeatures.length > 0) {
			// prevent connection attempt if features are invalid
			this.logger.verbose(`invalid features found: ${this._serverFeatureSet.invalidFeatures}`);
			this.logger.debug('connection will not be opened');
			this.status = connectionStatus.DISCONNECTED;
			throw new InvalidServerFeaturesError({
				invalidFeatures: this._serverFeatureSet.invalidFeatures,
			});
		}

		await this._getDbServerInfo(); // establish baseline for database server information

		this.logger.debug(`connection opened`);
		this.status = connectionStatus.CONNECTED;
	};

	/**
	 * Deploy database features
	 * @function deployFeatures
	 * @memberof Connection
	 * @instance
	 * @async
	 * @param {string} sourceDir - Database server directory to deploy features to
	 * @param {Object} options
	 * @param {boolean} [options.createDir=false] - Create deployment directory if it is missing
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
	 * @throws {DbServerError} (indirect) An error occurred on the database server
	 */
	deployFeatures = async (sourceDir, { createDir = false } = {}) => {
		this.logger.debug(`deploying features to directory ${sourceDir}`);
		if (sourceDir == null) {
			throw new InvalidParameterError({ parameterName: 'sourceDir' });
		}
		await this._getFeatureState();

		if (this._serverFeatureSet.invalidFeatures.length <= 0) {
			// there aren't any invalid features to deploy
			this.logger.debug(`no missing features to deploy`);
			return;
		}

		if (createDir) {
			// create deployment directory (if necessary)
			this.logger.debug(`creating deployment directory ${sourceDir}`);
			const data = {
				action: 'createDir',
				dirName: sourceDir,
			};
			await this._executeDb(data);
		}

		if (!Object.prototype.hasOwnProperty.call(this._serverFeatureSet.validFeatures, 'deploy')) {
			// deployment feature is unavailable - use basic deployment to make it available
			this.logger.debug(`deploying the "deployment" feature to ${sourceDir}`);
			const data = {
				action: 'deploy',
				sourceDir,
				source: await Connection.getUnibasicSource('deploy'),
				programName: Connection.getServerProgramName('deploy'),
			};

			await this._executeDb(data);

			// now that the deploy feature should be available, restart the deployment process
			await this.deployFeatures(sourceDir);
			return;
		}

		// deploy any other missing features
		await Promise.all(
			this._serverFeatureSet.invalidFeatures.map(async feature => {
				this.logger.debug(`deploying ${feature} to ${sourceDir}`);
				const options = {
					sourceDir,
					source: await Connection.getUnibasicSource(feature),
					programName: Connection.getServerProgramName(feature),
				};
				await this.executeDbFeature('deploy', options);
			}),
		);
	};

	/**
	 * Execute a database feature
	 * @function executeDbFeature
	 * @memberof Connection
	 * @instance
	 * @async
	 * @param {string} feature - Name of feature to execute
	 * @param {*} [options={}] - Options parameter to pass to database feature
	 * @returns {*} Output from database feature
	 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
	 * @throws {DbServerError} (indirect) An error occurred on the database server
	 */
	executeDbFeature = async (feature, options = {}) => {
		this.logger.debug(`executing database feature "${feature}"`);
		const data = {
			action: 'subroutine',
			// make sure to use the compatible server version of feature
			subroutineId: Connection.getServerProgramName(
				feature,
				this._serverFeatureSet.validFeatures[feature],
			),
			options,
		};

		this.logger.debug(`executing database subroutine ${data.subroutineId}`);

		return this._executeDb(data);
	};

	/**
	 * Get the current ISOCalendarDate from the database
	 * @function getDbDate
	 * @memberof Connection
	 * @instance
	 * @async
	 * @return {Promise.<String>} Current db server time as ISO 8601 String Date value (yyyy-mm-dd)
	 */
	getDbDate = async () => {
		await this._getDbServerInfo();
		return moment()
			.add(this._timeDrift)
			.format(ISOCalendarDateFormat);
	};

	/**
	 * Get the current ISOCalendarDateTime from the database
	 * @function getDbDateTime
	 * @memberof Connection
	 * @instance
	 * @async
	 * @return {Promise.<String>} Current db server time as ISO 8601 String date/time value (yyyy-mm-ddTHH:mm:ss.SSS)
	 */
	getDbDateTime = async () => {
		await this._getDbServerInfo();
		return moment()
			.add(this._timeDrift)
			.format(ISOCalendarDateTimeFormat);
	};

	/**
	 * Get the current ISOTime from the database
	 * @function getDbTime
	 * @memberof Connection
	 * @instance
	 * @async
	 * @return {Promise.<String>} Current db server time as ISO 8601 String Time value (HH:mm:ss.SSS)
	 */
	getDbTime = async () => {
		await this._getDbServerInfo();
		return moment()
			.add(this._timeDrift)
			.format(ISOTimeFormat);
	};

	/**
	 * Define a new model
	 * @function model
	 * @memberof Connection
	 * @instance
	 * @param {Schema} schema - Schema instance to derive model from
	 * @param {string} file - Name of database file associated with model
	 * @returns {Model} Model class
	 * @throws {InvalidParameterError} (indirect) An invalid parameter was passed to the function
	 */
	model = (schema, file) => {
		if (this.status !== connectionStatus.CONNECTED) {
			throw new Error('Cannot create model until database connection has been established.');
		}
		return compileModel(this, schema, file);
	};

	/* private instance methods */
	/**
	 * Execute a database function remotely
	 * @function _executeDb
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @param {Object} data
	 * @param {string} data.action - Remote action to invoke
	 * @param {*} data.xxx - Additional properties as required by remote function
	 * @returns {*} Output from database function execution
	 * @throws {InvalidParameterError} An invalid parameter was passed to the function
	 * @throws {ConnectionManagerError} An error occurred in connection manager communications
	 * @throws {DbServerError} An error occurred on the database server
	 */
	_executeDb = async data => {
		if (data == null || data.action == null) {
			// invalid database request
			this.logger.verbose(`invalid database request format`);
			throw new InvalidParameterError({ parameterName: 'data' });
		}
		this.logger.debug(`executing database function with action "${data.action}"`);

		let response;
		try {
			response = await axios.post(this._endpoint, { input: data });
		} catch (err) {
			throw new ConnectionManagerError({ request: err.request, response: err.response });
		}

		handleDbServerError(response);

		// return the relevant portion from the db server response
		return response.data.output;
	};

	/**
	 * Get the db server information (date, time, etc.)
	 * @function _getDbServerInfo
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @modifies {this}
	 */
	_getDbServerInfo = async () => {
		if (Date.now() > this._cacheExpiry) {
			this.logger.debug('getting db server information');
			const data = await this.executeDbFeature('getServerInfo');

			const { date, time } = data;

			this._timeDrift = moment(epoch)
				.add(date, 'days')
				.add(time, 'ms')
				.diff(moment());

			this._cacheExpiry = Date.now() + this._cacheMaxAge * 1000;
		}
	};

	/**
	 * Get the state of database server features
	 * @function _getFeatureState
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 */
	_getFeatureState = async () => {
		this.logger.debug(`getting state of database server features`);
		const serverFeatures = await this._getServerFeatures();

		this._serverFeatureSet = Object.entries(serverDependencies).reduce(
			(acc, [dependencyName, dependencyVersion]) => {
				if (!Object.prototype.hasOwnProperty.call(serverFeatures, dependencyName)) {
					// if the feature doesn't exist on the server then it is invalid
					acc.invalidFeatures.push(dependencyName);
					return acc;
				}

				const matchedVersion = semver.maxSatisfying(
					serverFeatures[dependencyName],
					dependencyVersion,
				);
				if (matchedVersion == null) {
					// no versions satisfy the requirement
					acc.invalidFeatures.push(dependencyName);
					return acc;
				}

				// return the match as a valid feature
				acc.validFeatures[dependencyName] = matchedVersion;
				return acc;
			},
			{
				validFeatures: {},
				invalidFeatures: [],
			},
		);
	};

	/**
	 * Get a list of database server features
	 * @function _getServerFeatures
	 * @memberof Connection
	 * @instance
	 * @private
	 * @async
	 * @returns {Object} Key(s): Feature(s) / Value(s): array(s) of versions
	 */
	_getServerFeatures = async () => {
		this.logger.debug(`getting list of features from database server`);
		const data = { action: 'featureList' };
		const response = await this._executeDb(data);

		if (!Array.isArray(response.features)) {
			this.logger.debug(`no features found on server`);
			return {};
		}

		return response.features.reduce((acc, feature) => {
			// only include programs in the format of mvom_feature@x.y.z
			const featureRegExp = new RegExp('^mvom_(.*)@(\\d\\.\\d\\.\\d.*$)');

			const match = featureRegExp.exec(feature);
			if (!match) {
				// does not match the format of an mvom feature program
				return acc;
			}

			const featureName = match[1]; // acquired from first capturing group
			const featureVersion = match[2]; // acquired from second capturing group

			if (!semver.valid(featureVersion)) {
				// a valid feature will contain an @-version specification that uses semver
				return acc;
			}

			this.logger.debug(
				`feature "${featureName}" version "${featureVersion}" found on database server`,
			);
			if (Object.prototype.hasOwnProperty.call(acc, featureName)) {
				// another version of this feature already present - add to list of feature's versions
				acc[featureName].push(featureVersion);
				return acc;
			}

			// add this feature to the returned set
			return {
				...acc,
				[featureName]: [featureVersion],
			};
		}, {});
	};
}

export default Connection;
