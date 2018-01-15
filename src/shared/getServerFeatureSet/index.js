import axios from 'axios';
import semver from 'semver';

const getServerFeatureSet = async (endpoint, sourceDir) => {
	const data = { action: 'programList', sourceDir };
	const response = await axios.post(endpoint, { input: data });
	if (response && response.data && response.data.output && +response.data.output.errorCode) {
		// handle specific error returned from subroutine
		throw new Error();
	}

	if (!response || !response.data || !response.data.output || !response.data.output.programs) {
		// handle invalid response
		throw new Error();
	}

	return response.data.output.programs.reduce((acc, feature) => {
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

export default getServerFeatureSet;
