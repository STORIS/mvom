import { dependencies as serverDependencies } from 'config/.mvomrc.json';

const getFeatureVersion = feature => serverDependencies[feature].match(/\d\.\d\.\d.*$/)[0];

export default getFeatureVersion;
