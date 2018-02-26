import { dependencies as serverDependencies } from '.mvomrc.json';

/**
 * Return the packaged specific version number of a feature
 * @function getFeatureVersion
 * @package
 * @private
 * @param {string} feature - Name of feature
 * @returns {string} Version in semver (x.y.z) format
 */
const getFeatureVersion = feature => serverDependencies[feature].match(/\d\.\d\.\d.*$/)[0];

export default getFeatureVersion;
