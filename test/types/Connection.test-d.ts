import { expectType } from 'tsd';
import { Connection, connectionStatus, createConnection, GenericObject, Model, Schema } from "../../src/";

// Connection
const dummyLogger = {
	error: () => {},
	warn: () => {},
	info: () => {},
	verbose: () => {},
	debug: () => {},
	silly: () => {},
};

const connection: Connection = createConnection('foo', 'bar');
expectType<Connection>(createConnection('foo', 'bar', {cacheMaxAge: 3600, logger: dummyLogger, timeout: 0})); // include optional params
expectType<Promise<void>>(connection.open());
expectType<Promise<void>>(connection.deployFeatures('foo'));
expectType<Promise<string>>(connection.getDbDate());
expectType<Promise<string>>(connection.getDbDateTime());
expectType<Promise<string>>(connection.getDbTime());
expectType<connectionStatus>(connection.status);

// Model
const testSchema: Schema = new Schema({test: 'foo'});
const modelClass: typeof Model = connection.model(testSchema, 'foo');
const model = new modelClass();
expectType<Promise<Model>>(model.save());
expectType<Promise<Model|null>>(model.deleteById('id'));
expectType<Promise<Model[]>>(model.find({}, {skip: 40, limit: null, sort: ['field']}));
expectType<Promise<GenericObject>>(model.findAndCount({}, {skip: 40, limit: null, sort: ['field']}));
expectType<Promise<Model>>(model.findById('id'));
expectType<Promise<Model[]>>(model.findByIds('id'));
expectType<Promise<Model[]>>(model.findByIds(['id']));
