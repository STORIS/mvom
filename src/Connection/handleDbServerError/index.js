import DbServerError from 'Errors/DbServer';
import RecordLockedError from 'Errors/RecordLocked';
import RecordVersionError from 'Errors/RecordVersion';
import dbErrors from 'shared/dbErrors';

/**
 * @function handleDbServerError
 * @package
 * @private
 * @param {Object} response - Response object obtained from db server
 * @throws {RecordLockedError} A record was locked and could not be updated
 * @throws {RecordVersionError} A record changed between being read and written and could not be updated
 * @throws {DbServerError} An error was encountered on the database server
 */
const handleDbServerError = response => {
	if (!response || !response.data || !response.data.output) {
		// handle invalid response
		throw new DbServerError({ message: 'Response from db server was malformed' });
	}

	const errorCode = +response.data.output.errorCode;

	if (errorCode) {
		switch (errorCode) {
			case dbErrors.recordLocked.code:
				throw new RecordLockedError();
			case dbErrors.recordVersion.code:
				throw new RecordVersionError();
			default:
				throw new DbServerError({ errorCode: response.data.output.errorCode });
		}
	}
};

export default handleDbServerError;
