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
	class InvalidParameterError extends Error {}
	before(() => {
		chai.use(chaiAsPromised);
		const Connection = class {};
		RewireAPI.__Rewire__('Connection', Connection);
		connection = new Connection();
		connection.logger = mockLogger;
		connection.executeDbFeature = executeDbFeature;

		RewireAPI.__Rewire__('Document', Document);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);

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
		RewireAPI.__ResetDependency__('InvalidParameterError');
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
				beforeEach(() => {
					exec.resolves({ count: 5, documents: ['foo', 'bar'] });
				});

				it('should call the query constructor with the passed parameters', async () => {
					await Test.find('foo', 'bar');
					assert.isTrue(queryConstructor.calledWith(Test, 'foo', 'bar'));
				});

				it('should return the results of the execution of the query', async () => {
					assert.deepEqual(await Test.find(), ['foo', 'bar']);
				});
			});

			describe('findAndCount', () => {
				beforeEach(() => {
					exec.resolves({ count: 5, documents: ['foo', 'bar'] });
				});

				it('should call the query constructor with the passed parameters', async () => {
					await Test.findAndCount('foo', 'bar');
					assert.isTrue(queryConstructor.calledWith(Test, 'foo', 'bar'));
				});

				it('should return the results of the execution of the query', async () => {
					assert.deepEqual(await Test.findAndCount(), { count: 5, documents: ['foo', 'bar'] });
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

				describe('findByIds', () => {
					it('should call makeModelFromDbResult for each item in the result array', async () => {
						const result = [
							{ record: 'foo1', _id: 'bar1', __v: 'baz1' },
							{ record: 'foo2', _id: 'bar2', __v: 'baz2' },
							{ record: 'foo3', _id: 'bar3', __v: 'baz3' },
						];
						executeDbFeature.resolves({ result });
						await Test.findByIds(['id1', 'id2', 'id3']);
						assert.isTrue(Test.makeModelFromDbResult.calledThrice);
						assert.isTrue(Test.makeModelFromDbResult.firstCall.calledWith(result[0]));
						assert.isTrue(Test.makeModelFromDbResult.secondCall.calledWith(result[1]));
						assert.isTrue(Test.makeModelFromDbResult.thirdCall.calledWith(result[2]));
					});

					it('should call findByIds dbFeature with an array even if a single id is passed in', async () => {
						const result = [{ record: 'foo1', _id: 'bar1', __v: 'baz1' }];
						executeDbFeature.resolves({ result });
						await Test.findByIds('id1');
						assert.isTrue(
							executeDbFeature.calledWith('findByIds', { filename: Test.file, ids: ['id1'] }),
						);
					});

					it('should return an array with null values for each empty string passed back from the dbFeature', async () => {
						const expectedResult = [null, null, null];
						const dbResult = ['', '', ''];
						executeDbFeature.resolves({ result: dbResult });
						assert.deepEqual(await Test.findByIds(['id1', {}, []]), expectedResult);
					});

					it('should throw an InvalidParameterError if no ids are passed in', () =>
						assert.isRejected(Test.findByIds(), InvalidParameterError));
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
			const filename = 'filename-value';
			let Test;
			before(() => {
				Test = compileModel(connection, schema, filename);
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

				it('should enrich and rethrow error if executeDbFeature rejects', async () => {
					validate.resolves({});
					const error = new Error();
					error.other = { foo: 'bar' };
					executeDbFeature.rejects(error);
					const _id = '_id-value';
					const test = new Test({}, { _id });
					test.transformDocumentToRecord = stub();
					try {
						await test.save();
						assert.fail(); // if save() doesn't reject then that is a failed test
					} catch (err) {
						const expected = {
							other: {
								foo: 'bar',
								filename,
								_id,
							},
						};
						assert.deepInclude(err, expected);
					}
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
