/* eslint-disable no-underscore-dangle */
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import mockLogger from 'testHelpers/mockLogger';
import compileModel, { __RewireAPI__ as RewireAPI } from './';

describe('compileModel', () => {
	let connection;
	let schema;
	const Document = class {
		transformationErrors = [
			{ transformClass: 'class1', transformValue: 'value1' },
			{ transformClass: 'class2', transformValue: 'value2' },
		];
	};
	const executeDbFeature = stub();
	const queryConstructor = stub();
	const exec = stub();
	before(() => {
		chai.use(chaiAsPromised);
		const Connection = class {};
		RewireAPI.__Rewire__('Connection', Connection);
		connection = new Connection();
		connection.logger = mockLogger;
		connection.executeDbFeature = executeDbFeature;

		RewireAPI.__Rewire__('Document', Document);

		const Query = class {
			constructor(Model, selectionCriteria, options) {
				queryConstructor(Model, selectionCriteria, options);
			}
			exec = exec;
		};
		RewireAPI.__Rewire__('Query', Query);

		const Schema = class {};
		RewireAPI.__Rewire__('Schema', Schema);
		schema = new Schema();
	});

	beforeEach(() => {
		executeDbFeature.reset();
		queryConstructor.resetHistory();
		exec.resetHistory();
		connection.logger.warn.resetHistory();
	});

	after(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('Document');
		RewireAPI.__ResetDependency__('Query');
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
			describe('find', () => {
				it('should call the query constructor with the passed parameters', async () => {
					const Test = compileModel(connection, schema, 'foo');
					await Test.find('foo', 'bar');
					assert.isTrue(queryConstructor.calledWith(Test, 'foo', 'bar'));
				});

				it('should return the results of the execution of the query', async () => {
					exec.resolves('foo');
					const Test = compileModel(connection, schema, 'foo');
					assert.strictEqual(await Test.find(), 'foo');
				});
			});

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
					_id: 'bar',
					__id: 'bar',
					__v: 'baz',
				});
			});

			it('should call the warn logger once for each transformation error added by the Document constructor', () => {
				const Test = compileModel(connection, schema, 'foo');
				// eslint-disable-next-line no-unused-vars
				const test = new Test();
				assert.isTrue(connection.logger.warn.calledTwice);
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
