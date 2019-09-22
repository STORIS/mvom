import * as Errors from '#sharedjs/Errors';
import createConnection from './createConnection';
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

/* eslint-disable-next-line import/no-default-export */
export default mvom;
export { Errors, Schema, createConnection };
