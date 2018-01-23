import axios from 'axios';
import semver from 'semver';
// temporarily not using import due to issue with babel-plugin-module-resolver https://github.com/tleunen/babel-plugin-module-resolver/pull/253
// import { dependencies as serverDependencies } from '.mvomrc.json';
import getServerProgramName from 'shared/getServerProgramName';
import getUnibasicSource from 'shared/getUnibasicSource';

const { dependencies: serverDependencies } = require('../.mvomrc.json');

/** A connection object
 * @param {Object} options
 * @param {string} options.connectionManagerUri - URI of the connection manager which faciliates access to the mv database
 * @param {string} options.account - Database account that connection will be used against
 * @param {Object} options.logger - Winston logger instance used for diagnostic logging
 */
class Connection {
	/**
	 * @typedef {Object} serverFeatureSet
	 * @private
	 * @property {Object} validFeatures - Key/value pairs of valid database server features and versions
	 * @property {Array} invalidFeatures - List of invalid database server features
	 */
	serverFeatureSet = { validFeatures: {}, invalidFeatures: [] };

	constructor({ connectionManagerUri, account, logger }) {
		logger.debug(`creating new connection instance`);
		// establish the full uri for connection
		this.endpoint = `${connectionManagerUri}/${account}/subroutine/${getServerProgramName(
			'entry',
		)}`;
		this.logger = logger;
	}

	/**
	 * Open a database connection
	 * @async
	 * @throws
	 */
	open = async () => {
		this.logger.debug(`opening connection`);
		await this._getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.length > 0) {
			// prevent connection attempt if features are invalid
			this.logger.verbose(`invalid features found: ${this.serverFeatureSet.invalidFeatures}`);
			this.logger.debug('connection will not be opened');
			throw new Error();
		}

		this.logger.debug(`connection opened`);
	};

	/**
	 * Deploy database features
	 * @async
	 * @param {string} sourceDir - Database server directory to deploy features to
	 * @param {Object} options
	 * @param {boolean} [options.createDir=false] - Create deployment directory if it is missing
	 * @throws
	 */
	deployFeatures = async (sourceDir, { createDir = false } = {}) => {
		this.logger.debug(`deploying features to directory ${sourceDir}`);
		if (sourceDir == null) {
			this.logger.verbose(`invalid sourceDir parameter provided`);
			throw new Error();
		}
		await this._getFeatureState();

		if (this.serverFeatureSet.invalidFeatures.length <= 0) {
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

		if (!Object.prototype.hasOwnProperty.call(this.serverFeatureSet.validFeatures, 'deploy')) {
			// deployment feature is unavailable - use basic deployment to make it available
			this.logger.debug(`deploying the "deployment" feature to ${sourceDir}`);
			const data = {
				action: 'deploy',
				sourceDir,
				source: await getUnibasicSource('deploy'),
				programName: getServerProgramName('deploy'),
			};

			await this._executeDb(data);

			// now that the deploy feature should be available, restart the deployment process
			await this.deployFeatures(sourceDir);
			return;
		}

		// deploy any other missing features
		await Promise.all(
			this.serverFeatureSet.invalidFeatures.map(async feature => {
				this.logger.debug(`deploying ${feature} to ${sourceDir}`);
				const options = {
					sourceDir,
					source: await getUnibasicSource(feature),
					programName: getServerProgramName(feature),
				};
				await this.executeDbFeature('deploy', options);
			}),
		);
	};

	/**
	 * Execute a database feature
	 * @async
	 * @param {string} feature - Name of feature to execute
	 * @param {*} options - Options parameter to pass to database feature
	 * @returns {*} Output from database feature
	 * @throws
	 */
	executeDbFeature = async (feature, options) => {
		this.logger.debug(`executing database feature "${feature}"`);
		const data = {
			action: 'subroutine',
			// make sure to use the compatible server version of feature
			subroutineId: getServerProgramName(feature, this.serverFeatureSet.validFeatures[feature]),
			options,
		};

		this.logger.debug(`executing database subroutine ${data.subroutineId}`);

		return this._executeDb(data);
	};

	/**
	 * Execute a database function remotely
	 * @private
	 * @async
	 * @param {Object} data
	 * @param {string} data.action - Remote action to invoke
	 * @param {*} data.xxx - Additional properties as required by remote function
	 * @returns {*} Output from database function execution
	 * @throws
	 */
	_executeDb = async data => {
		if (data == null || data.action == null) {
			// invalid database request
			this.logger.verbose(`invalid database request format`);
			throw new Error();
		}
		this.logger.debug(`executing database function with action "${data.action}"`);
		const response = await axios.post(this.endpoint, { input: data });
		if (!response || !response.data || !response.data.output) {
			// handle invalid response
			this.logger.verbose(`received an invalid response from database server`);
			throw new Error();
		}

		if (+response.data.output.errorCode) {
			// handle specific error returned from subroutine
			this.logger.verbose(
				`received error code "${response.data.output.errorCode}" from database server`,
			);
			throw new Error();
		}

		// return the relevant portion from the db server response
		return response.data.output;
	};

	/**
	 * Get the state of database server features
	 * @private
	 * @async
	 * @throws
	 */
	_getFeatureState = async () => {
		this.logger.debug(`getting state of database server features`);
		const serverFeatures = await this._getServerFeatures();

		this.serverFeatureSet = Object.keys(serverDependencies).reduce(
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
	 * @private
	 * @async
	 * @returns {serverFeatureSet}
	 * @throws
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
