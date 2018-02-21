/* eslint-disable no-underscore-dangle */
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import mockLogger from 'testHelpers/mockLogger';
import compileModel, { __RewireAPI__ as RewireAPI } from './';

describe('compileModel', () => {
	let connection;
	let schema;
	const Document = class {};
	const executeDbFeature = stub();
	before(() => {
		chai.use(chaiAsPromised);
		const Connection = class {};
		RewireAPI.__Rewire__('Connection', Connection);
		connection = new Connection();
		connection.logger = mockLogger;
		connection.executeDbFeature = executeDbFeature;

		RewireAPI.__Rewire__('Document', Document);

		const Schema = class {};
		RewireAPI.__Rewire__('Schema', Schema);
		schema = new Schema();
	});

	beforeEach(() => {
		executeDbFeature.reset();
	});

	after(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('Document');
		RewireAPI.__ResetDependency__('Schema');
	});

	it('should throw an error if Connection not provided', () => {
		assert.throws(compileModel.bind(compileModel, 'foo', schema, 'bar'));
	});

	it('should throw an error if Schema not provided', () => {
		assert.throws(compileModel.bind(compileModel, connection, 'foo', 'bar'));
	});

	it('should throw an error if file not provided', () => {
		assert.throws(compileModel.bind(compileModel, connection, schema));
	});

	describe('Model class', () => {
		describe('static methods', () => {
			describe('findById', () => {
				it('should instantiate a new model instance with the results of the dbFeature execution', async () => {
					executeDbFeature.resolves({ result: { record: 'foo', _id: 'bar', __v: 'baz' } });
					const Test = compileModel(connection, schema, 'foo');
					assert.deepInclude(await Test.findById(), {
						_id: 'bar',
						__id: 'bar',
						__v: 'baz',
					});
				});
			});
		});

		describe('constructor', () => {
			it('should instantiate a new instance of the class', () => {
				const Test = compileModel(connection, schema, 'foo');
				assert.instanceOf(new Test(), Test);
			});

			it('should set the expected instance properties', () => {
				const Test = compileModel(connection, schema, 'foo');
				assert.deepInclude(new Test({ _id: 'bar', __v: 'baz' }), {
					_connection: connection,
					_file: 'foo',
					_id: 'bar',
					__id: 'bar',
					__v: 'baz',
				});
			});
		});

		describe('instance methods', () => {
			let Test;
			before(() => {
				Test = compileModel(connection, schema, 'foo');
			});

			describe('save', () => {
				it('should throw an error if an _id has not been added to the instance', () => {
					const test = new Test();
					assert.isRejected(test.save());
				});

				it('should instantiate a new model instance with the results of the dbFeature execution', async () => {
					executeDbFeature.resolves({ result: { record: [], _id: 'bar', __v: 'baz' } });
					const test = new Test({ record: [], _id: 'foo' });
					test.transformDocumentToRecord = stub();
					assert.deepInclude(await test.save(), {
						_id: 'bar',
						__id: 'bar',
						__v: 'baz',
					});
				});
			});
		});

		describe('instance setters', () => {
			it('should set the hidden __id property', () => {
				const Test = compileModel(connection, schema, 'foo');
				const test = new Test();
				test._id = 'foo';
				assert.strictEqual(test.__id, 'foo');
			});

			it('should disallow mutating the hidden __id property once set', () => {
				const Test = compileModel(connection, schema, 'foo');
				const test = new Test();
				test._id = 'foo';
				assert.throws(() => {
					test._id = 'bar';
				});
				assert.strictEqual(test.__id, 'foo');
			});
		});
	});
});
