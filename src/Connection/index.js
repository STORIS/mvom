import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import compileModel from 'compileModel';
import ConnectionManagerError from 'Errors/ConnectionManager';
import DbServerError from 'Errors/DbServer';
import InvalidParameterError from 'Errors/InvalidParameter';
import InvalidServerFeaturesError from 'Errors/InvalidServerFeatures';
import getFeatureVersion from 'shared/getFeatureVersion';
import connectionStatus from 'shared/constants/connectionStatus';
import { dependencies as serverDependencies } from '.mvomrc.json';

/** A connection object
 * @param {Object} options
 * @param {string} options.connectionManagerUri - URI of the connection manager which faciliates access to the mv database
 * @param {string} options.account - Database account that connection will be used against
 * @param options.logger - Winston logger instance used for diagnostic logging
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

	constructor({ connectionManagerUri, account, logger }) {
		logger.debug(`creating new connection instance`);
		/**
		 * URI of the full endpoint for communicating with the database
		 * @member {string} _endpoint
		 * @memberof Connection
		 * @instance
		 * @private
		 */
		this._endpoint = `${connectionManagerUri}/${account}/subroutine/${Connection.getServerProgramName(
			'entry',
		)}`;
		/**
		 * Winston logger instance used for diagnostic logging
		 * @member logger
		 * @memberof Connection
		 * @instance
		 */
		this.logger = logger;
		/**
		 * Connection status enumeration
		 * @member status
		 * @memberof Connection
		 * @instance
		 */
		this.status = connectionStatus.DISCONNECTED;
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
	 * @param {*} options - Options parameter to pass to database feature
	 * @returns {*} Output from database feature
	 * @throws {ConnectionManagerError} (indirect) An error occurred in connection manager communications
	 * @throws {DbServerError} (indirect) An error occurred on the database server
	 */
	executeDbFeature = async (feature, options) => {
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

		if (!response || !response.data || !response.data.output) {
			// handle invalid response
			throw new DbServerError();
		}

		if (+response.data.output.errorCode) {
			// handle specific error returned from subroutine
			throw new DbServerError({ errorCode: response.data.output.errorCode });
		}

		// return the relevant portion from the db server response
		return response.data.output;
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

		this._serverFeatureSet = Object.keys(serverDependencies).reduce(
			(acc, dependency) => {
				if (!Object.prototype.hasOwnProperty.call(serverFeatures, dependency)) {
					// if the feature doesn't exist on the server then it is invalid
					acc.invalidFeatures.push(dependency);
					return acc;
				}

				const matchedVersion = semver.maxSatisfying(
					serverFeatures[dependency],
					serverDependencies[dependency],
				);
				if (matchedVersion == null) {
					// no versions satisfy the requirement
					acc.invalidFeatures.push(dependency);
					return acc;
				}

				// return the match as a valid feature
				acc.validFeatures[dependency] = matchedVersion;
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
