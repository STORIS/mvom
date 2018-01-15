import semver from 'semver';
// temporarily not using import due to issue with babel-plugin-model-resolver https://github.com/tleunen/babel-plugin-module-resolver/pull/253
// import { dependencies as serverDependencies } from '.mvomrc.json';
import getServerFeatureSet from 'shared/getServerFeatureSet';

const { dependencies: serverDependencies } = require('../../.mvomrc.json');

const getFeatureState = async (endpoint, sourceDir) => {
	const serverFeatures = await getServerFeatureSet(endpoint, sourceDir);

	return Object.keys(serverDependencies).reduce(
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

export default getFeatureState;
