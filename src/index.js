import Connection from 'Connection';
import deployFeatures from 'shared/deployFeatures';
import getFeatureState from 'shared/getFeatureState';
import getServerProgramName from 'shared/getServerProgramName';

class mvom {
	static connect = async (connectionManagerUri, { account, sourceDir }) => {
		if (account == null || sourceDir == null) {
			throw new Error();
		}
		const endpoint = `${connectionManagerUri}/${account}/subroutine/${getServerProgramName(
			'entry',
		)}`;
		const serverFeatureSet = await getFeatureState(endpoint, sourceDir);

		if (serverFeatureSet.invalidFeatures.length > 0) {
			// need to deploy updated feature package
			await deployFeatures(endpoint, sourceDir, serverFeatureSet);
		}

		// do some stuff
		return new Connection({ endpoint });
	};
}

export default mvom;
