import getFeatureVersion from 'shared/getFeatureVersion';

const getServerProgramName = (feature, options = {}) => {
	const version = options.version || getFeatureVersion(feature);
	return `mvom_${feature}@${version}`;
};

export default getServerProgramName;
