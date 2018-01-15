import axios from 'axios';
import getServerProgramName from 'shared/getServerProgramName';
import getUnibasicSource from 'shared/getUnibasicSource';

const deployFeatures = async (endpoint, sourceDir, serverFeatureSet) => {
	if (!Object.prototype.hasOwnProperty.call(serverFeatureSet.validFeatures, 'deploy')) {
		// deployment feature is unavailable - use basic deployment to make it available
		const data = {
			action: 'deploy',
			sourceDir,
			source: await getUnibasicSource('deploy'),
			programName: getServerProgramName('deploy'),
		};
		const response = await axios.post(endpoint, { input: data });
		if (response && response.data && response.data.output && +response.data.output.errorCode) {
			// handle specific error returned from subroutine
			throw new Error();
		}

		if (!response || !response.data || !response.data.output) {
			// handle invalid response
			throw new Error();
		}
	}
};

export default deployFeatures;
