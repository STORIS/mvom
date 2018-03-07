import ConnectionManagerError from './ConnectionManager';
import DataValidationError from './DataValidation';
import DbServerError from './DbServer';
import DisallowDirectError from './DisallowDirect';
import InvalidParameterError from './InvalidParameter';
import InvalidServerFeaturesError from './InvalidServerFeatures';
import NotImplementedError from './NotImplemented';
import TransformDataError from './TransformData';

export default {
	ConnectionManager: ConnectionManagerError,
	DataValidation: DataValidationError,
	DbServer: DbServerError,
	DisallowDirect: DisallowDirectError,
	InvalidParameter: InvalidParameterError,
	InvalidServerFeatures: InvalidServerFeaturesError,
	NotImplemented: NotImplementedError,
	TransformData: TransformDataError,
};
