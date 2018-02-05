// temporarily not using import due to issue with babel-plugin-model-resolver https://github.com/tleunen/babel-plugin-module-resolver/pull/253
// import { dependencies as serverDependencies } from '.mvomrc.json';
const { dependencies: serverDependencies } = require('../../.mvomrc.json');

/**
 * Return the packaged specific version number of a feature
 * @function getFeatureVersion
 * @private
 * @param {string} feature - Name of feature
 * @returns {string} Version in semver (x.y.z) format
 */
const getFeatureVersion = feature => serverDependencies[feature].match(/\d\.\d\.\d.*$/)[0];

export default getFeatureVersion;
