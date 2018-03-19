const dbErrors = {
	malformedInput: { code: 1, message: 'Malformed input passed to db server' },
	unsupportedAction: { code: 2, message: 'Database server does not support the passed action' },
	deployment: { code: 3, message: 'Error in database server feature deployment' },
	udo: { code: 4, message: 'Error in database UDO function' },
	fileOpen: { code: 5, message: 'Error opening database file' },
	fileCreate: { code: 6, message: 'Error creating database file' },
	recordRead: { code: 7, message: 'Error reading database record' },
	recordWrite: { code: 8, message: 'Error writing database record' },
	recordDelete: { code: 9, message: 'Error deleting database record' },
	recordNotFound: { code: 10, message: 'Database record not found' },
	recordVersion: { code: 11, message: 'Database record version has changed' },
	recordLocked: { code: 12, message: 'Database record is locked' },
	query: { code: 13, message: 'Error in database query' },
	digestHash: { code: 14, message: 'Error in constructing digest hash' },
};

export default dbErrors;
