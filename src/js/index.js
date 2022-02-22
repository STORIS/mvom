import * as Errors from '#shared/errors';
import createConnection from './createConnection';
import Document from './Document';
import Schema from './Schema';

/**
 * Main mvom module
 * @module mvom
 */
const mvom = {
	/**
	 * @member {Errors} Errors
	 * @memberof mvom
	 */
	Errors,
	/**
	 * @member {Schema} Schema
	 * @memberof mvom
	 */
	Schema,
	createConnection,
};

export default mvom;
export { Document, Errors, Schema, createConnection };
