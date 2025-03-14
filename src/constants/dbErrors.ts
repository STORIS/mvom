interface DbError {
	code: number;
	message: string;
}

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
	recordVersion: { code: 10, message: 'Database record version has changed' },
	recordLocked: { code: 11, message: 'Database record is locked' },
	query: { code: 12, message: 'Error in database query' },
	digestHash: { code: 13, message: 'Error in constructing digest hash' },
	foreignKeyValidation: { code: 14, message: 'Foreign key validation error' },
	fileEncodeBase64: { code: 15, message: 'Error in encoding the file as Base64 string' },
	recordWriteTriggerConstraint: { code: 16, message: 'Record write rejected by trigger' },
	recordWriteTriggerError: {
		code: 17,
		message: 'Error writing database record due to trigger error',
	},
	recordWriteDuplicateIndex: {
		code: 18,
		message: 'Record write rejected due to violating duplicate index constraint',
	},
	recordWriteUnknown: { code: 19, message: 'Unknown error writing database record' },
	maxPayloadExceeded: { code: 20, message: 'Maximum return payload size exceeded' },
	recordNotFound: { code: 21, message: 'Database record not found' },
} as const satisfies Record<string, DbError>;

export type DbErrors = typeof dbErrors;
export type DbErrorCodes = DbErrors[keyof DbErrors]['code'];

export default dbErrors;
