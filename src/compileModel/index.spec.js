/* eslint-disable no-underscore-dangle */
import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { stub } from 'sinon';
import mockLogger from 'testHelpers/mockLogger';
import compileModel, { __RewireAPI__ as RewireAPI } from './';

describe('compileModel', () => {
	let connection;
	let schema;

	const transformRecordToDocument = stub();
	const validate = stub();
	const Document = class {
		transformRecordToDocument = transformRecordToDocument;
		validate = validate;
		transformationErrors = [
			{ transformClass: 'class1', transformValue: 'value1' },
			{ transformClass: 'class2', transformValue: 'value2' },
		];
	};
	const executeDbFeature = stub();
	const queryConstructor = stub();
	const exec = stub();

	class DataValidationError extends Error {}
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

		RewireAPI.__Rewire__('DataValidationError', DataValidationError);
	});

	beforeEach(() => {
		executeDbFeature.reset();
		queryConstructor.resetHistory();
		exec.resetHistory();
		connection.logger.warn.resetHistory();
		transformRecordToDocument.resetHistory();
		validate.reset();
	});

	after(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('Document');
		RewireAPI.__ResetDependency__('Query');
		RewireAPI.__ResetDependency__('Schema');
		RewireAPI.__ResetDependency__('DataValidationError');
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
			let Test;
			before(() => {
				Test = compileModel(connection, schema, 'foo');
			});

			describe('find', () => {
				it('should call the query constructor with the passed parameters', async () => {
					await Test.find('foo', 'bar');
					assert.isTrue(queryConstructor.calledWith(Test, 'foo', 'bar'));
				});

				it('should return the results of the execution of the query', async () => {
					exec.resolves('foo');
					assert.strictEqual(await Test.find(), 'foo');
				});
			});

			describe('makeModelFromDbResult', () => {
				it('should call transformRecordToDocument', () => {
					Test.makeModelFromDbResult({ record: 'foo' });
					assert.isTrue(transformRecordToDocument.calledOnce);
					assert.isTrue(transformRecordToDocument.calledWith('foo'));
				});

				it('should return an instance of the model', () => {
					assert.instanceOf(Test.makeModelFromDbResult(), Test);
				});

				it('should return an instance of the model with the passed id and version values', async () => {
					assert.deepInclude(
						await Test.makeModelFromDbResult({ record: 'foo', _id: 'bar', __v: 'baz' }),
						{
							_id: 'bar',
							__id: 'bar',
							__v: 'baz',
						},
					);
				});
			});

			describe('calls makeModelFromDbResult', () => {
				before(() => {
					stub(Test, 'makeModelFromDbResult');
				});

				after(() => {
					Test.makeModelFromDbResult.restore();
				});

				beforeEach(() => {
					Test.makeModelFromDbResult.resetHistory();
				});

				describe('deleteById', () => {
					it('should call makeModelFromDbResult', async () => {
						const result = { record: 'foo', _id: 'bar', __v: 'baz' };
						executeDbFeature.resolves({ result });
						await Test.deleteById();
						assert.isTrue(Test.makeModelFromDbResult.calledOnce);
						assert.isTrue(Test.makeModelFromDbResult.calledWith(result));
					});

					it('should return null if dbFeature resolves with null', async () => {
						executeDbFeature.resolves({ result: null });
						assert.isNull(await Test.deleteById());
					});
				});

				describe('findById', () => {
					it('should call makeModelFromDbResult', async () => {
						const result = { record: 'foo', _id: 'bar', __v: 'baz' };
						executeDbFeature.resolves({ result });
						await Test.findById();
						assert.isTrue(Test.makeModelFromDbResult.calledOnce);
						assert.isTrue(Test.makeModelFromDbResult.calledWith(result));
					});

					it('should return null if the dbFeature returns empty string (document not found)', async () => {
						executeDbFeature.resolves({ result: '' });
						assert.isNull(await Test.findById());
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
				assert.deepInclude(new Test({}, { _id: 'bar', __v: 'baz' }), {
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
					return assert.isRejected(test.save());
				});

				it('should throw DataValidationError if validate resolves with errors', () => {
					validate.resolves({ foo: 'bar' });
					const test = new Test({}, { _id: 'foo' });
					return assert.isRejected(test.save(), DataValidationError);
				});

				it('should instantiate a new model instance with the results of the dbFeature execution', async () => {
					validate.resolves({});
					executeDbFeature.resolves({ result: { record: [], _id: 'bar', __v: 'baz' } });
					const test = new Test({}, { _id: 'foo' });
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
