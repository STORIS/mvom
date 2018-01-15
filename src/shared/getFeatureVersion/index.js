// temporarily not using import due to issue with babel-plugin-model-resolver https://github.com/tleunen/babel-plugin-module-resolver/pull/253
// import { dependencies as serverDependencies } from '.mvomrc.json';
const { dependencies: serverDependencies } = require('../../.mvomrc.json');

const getFeatureVersion = feature => serverDependencies[feature].match(/\d\.\d\.\d.*$/)[0];

export default getFeatureVersion;
