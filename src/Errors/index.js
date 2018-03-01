import ConnectionManagerError from './ConnectionManager';
import DbServerError from './DbServer';
import DisallowDirectError from './DisallowDirect';
import InvalidParameterError from './InvalidParameter';
import InvalidServerFeaturesError from './InvalidServerFeatures';
import TransformDataError from './TransformData';

export default {
	ConnectionManager: ConnectionManagerError,
	DbServer: DbServerError,
	DisallowDirect: DisallowDirectError,
	InvalidParameter: InvalidParameterError,
	InvalidServerFeatures: InvalidServerFeaturesError,
	TransformData: TransformDataError,
};
