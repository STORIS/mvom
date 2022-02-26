import * as Errors from '#shared/errors';
import Document from '../ts/Document';
import Schema from '../ts/Schema';
import createConnection from './createConnection';

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
