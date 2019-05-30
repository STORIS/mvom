import Errors from 'Errors';
import Schema from 'Schema';
import createConnection from 'createConnection';

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
export { Errors, Schema, createConnection };
