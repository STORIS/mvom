import getFeatureVersion from 'shared/getFeatureVersion';

/**
 * Get the exact name of a program on the database server
 * @private
 * @param {string} feature - Feature name
 * @param {object} [options={}]
 * @param {string} [options.version=PackagedVersion] - Version of feature to use
 * @returns {string} Name of the database server program
 */
const getServerProgramName = (feature, options = {}) => {
	const version = options.version || getFeatureVersion(feature);
	return `mvom_${feature}@${version}`;
};

export default getServerProgramName;
