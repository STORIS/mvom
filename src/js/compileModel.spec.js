/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
import { mockLogger } from '#test/helpers';
/* eslint-disable-next-line import/named */
import compileModel, { __RewireAPI__ as RewireAPI } from './compileModel';

describe('compileModel', () => {
	let connection;
	let schema;

	const transformRecordToDocument = stub();
	const validate = stub();
	const Document = class {
		_transformRecordToDocument = transformRecordToDocument;

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
	beforeAll(() => {
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

	afterAll(() => {
		RewireAPI.__ResetDependency__('Connection');
		RewireAPI.__ResetDependency__('Document');
		RewireAPI.__ResetDependency__('Query');
		RewireAPI.__ResetDependency__('Schema');
		RewireAPI.__ResetDependency__('DataValidationError');
		RewireAPI.__ResetDependency__('InvalidParameterError');
	});

	test('should throw an error if Connection not provided', () => {
		expect(compileModel.bind(compileModel, 'foo', schema, 'bar')).toThrow();
	});

	test('should throw an error if Schema not provided', () => {
		expect(compileModel.bind(compileModel, connection, 'foo', 'bar')).toThrow();
	});

	test('should throw an error if file not provided', () => {
		expect(compileModel.bind(compileModel, connection, schema)).toThrow();
	});

	describe('Model class', () => {
		describe('static methods', () => {
			let Test;
			beforeAll(() => {
				Test = compileModel(connection, schema, 'foo');
			});

			describe('find', () => {
				beforeEach(() => {
					exec.resolves({ count: 5, documents: ['foo', 'bar'] });
				});

				test('should call the query constructor with the passed parameters', async () => {
					await Test.find('foo', 'bar');
					expect(queryConstructor.calledWith(Test, 'foo', 'bar')).toBe(true);
				});

				test('should return the results of the execution of the query', async () => {
					expect(await Test.find()).toEqual(['foo', 'bar']);
				});
			});

			describe('findAndCount', () => {
				beforeEach(() => {
					exec.resolves({ count: 5, documents: ['foo', 'bar'] });
				});

				test('should call the query constructor with the passed parameters', async () => {
					await Test.findAndCount('foo', 'bar');
					expect(queryConstructor.calledWith(Test, 'foo', 'bar')).toBe(true);
				});

				test('should return the results of the execution of the query', async () => {
					expect(await Test.findAndCount()).toEqual({ count: 5, documents: ['foo', 'bar'] });
				});
			});

			describe('makeModelFromDbResult', () => {
				test('should return an instance of the model', () => {
					expect(Test.makeModelFromDbResult()).toBeInstanceOf(Test);
				});

				test('should return an instance of the model with the passed id and version values', async () => {
					expect(
						await Test.makeModelFromDbResult({ record: 'foo', _id: 'bar', __v: 'baz' }),
					).toMatchObject({
						_id: 'bar',
						__id: 'bar',
						__v: 'baz',
					});
				});
			});

			describe('calls makeModelFromDbResult', () => {
				beforeAll(() => {
					stub(Test, 'makeModelFromDbResult');
				});

				afterAll(() => {
					Test.makeModelFromDbResult.restore();
				});

				beforeEach(() => {
					Test.makeModelFromDbResult.resetHistory();
				});

				describe('deleteById', () => {
					test('should call makeModelFromDbResult', async () => {
						const result = { record: 'foo', _id: 'bar', __v: 'baz' };
						executeDbFeature.resolves({ result });
						await Test.deleteById();
						expect(Test.makeModelFromDbResult.calledOnce).toBe(true);
						expect(Test.makeModelFromDbResult.calledWith(result)).toBe(true);
					});

					test('should return null if dbFeature resolves with null', async () => {
						executeDbFeature.resolves({ result: null });
						expect(await Test.deleteById()).toBeNull();
					});
				});

				describe('findById', () => {
					test('should call makeModelFromDbResult', async () => {
						const result = { record: 'foo', _id: 'bar', __v: 'baz' };
						executeDbFeature.resolves({ result });
						await Test.findById();
						expect(Test.makeModelFromDbResult.calledOnce).toBe(true);
						expect(Test.makeModelFromDbResult.calledWith(result)).toBe(true);
					});

					test('should return null if the dbFeature returns empty string (document not found)', async () => {
						executeDbFeature.resolves({ result: '' });
						expect(await Test.findById()).toBeNull();
					});
				});

				describe('findByIds', () => {
					test('should call makeModelFromDbResult for each item in the result array', async () => {
						const result = [
							{ record: 'foo1', _id: 'bar1', __v: 'baz1' },
							{ record: 'foo2', _id: 'bar2', __v: 'baz2' },
							{ record: 'foo3', _id: 'bar3', __v: 'baz3' },
						];
						executeDbFeature.resolves({ result });
						await Test.findByIds(['id1', 'id2', 'id3']);
						expect(Test.makeModelFromDbResult.calledThrice).toBe(true);
						expect(Test.makeModelFromDbResult.firstCall.calledWith(result[0])).toBe(true);
						expect(Test.makeModelFromDbResult.secondCall.calledWith(result[1])).toBe(true);
						expect(Test.makeModelFromDbResult.thirdCall.calledWith(result[2])).toBe(true);
					});

					test('should call findByIds dbFeature with an array even if a single id is passed in', async () => {
						const result = [{ record: 'foo1', _id: 'bar1', __v: 'baz1' }];
						executeDbFeature.resolves({ result });
						await Test.findByIds('id1');
						expect(
							executeDbFeature.calledWith('findByIds', { filename: Test.file, ids: ['id1'] }),
						).toBe(true);
					});

					test('should return an array with null values for each empty string passed back from the dbFeature', async () => {
						const expectedResult = [null, null, null];
						const dbResult = ['', '', ''];
						executeDbFeature.resolves({ result: dbResult });
						expect(await Test.findByIds(['id1', {}, []])).toEqual(expectedResult);
					});

					test('should throw an InvalidParameterError if no ids are passed in', async () => {
						await expect(Test.findByIds()).rejects.toThrow(InvalidParameterError);
					});
				});
			});
		});

		describe('constructor', () => {
			test('should instantiate a new instance of the class', () => {
				const Test = compileModel(connection, schema, 'foo');
				expect(new Test()).toBeInstanceOf(Test);
			});

			test('should set the expected instance properties', async () => {
				const Test = compileModel(connection, schema, 'foo');
				expect(new Test({ _id: 'bar', __v: 'baz' })).toMatchObject({
					_id: 'bar',
					__id: 'bar',
					__v: 'baz',
				});
			});

			test('should call the warn logger once for each transformation error added by the Document constructor', () => {
				const Test = compileModel(connection, schema, 'foo');
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const test = new Test();
				expect(connection.logger.warn.calledTwice).toBe(true);
			});
		});

		describe('instance methods', () => {
			const filename = 'filename-value';
			let Test;
			beforeAll(() => {
				Test = compileModel(connection, schema, filename);
			});

			describe('save', () => {
				test('should throw an error if an _id has not been added to the instance', async () => {
					const test = new Test();
					await expect(test.save()).rejects.toThrow();
				});

				test('should throw DataValidationError if validate resolves with errors', async () => {
					validate.resolves({ foo: 'bar' });
					const test = new Test({ _id: 'foo' });
					await expect(test.save()).rejects.toThrow(DataValidationError);
				});

				test('should instantiate a new model instance with the results of the dbFeature execution', async () => {
					validate.resolves({});
					executeDbFeature.resolves({ result: { record: [], _id: 'bar', __v: 'baz' } });
					const test = new Test({ _id: 'foo' });
					test.transformDocumentToRecord = stub();
					expect(await test.save()).toMatchObject({ _id: 'bar', __id: 'bar', __v: 'baz' });
				});

				test('should enrich and rethrow error if executeDbFeature rejects', async () => {
					validate.resolves({});
					const error = new Error();
					error.other = { foo: 'bar' };
					executeDbFeature.rejects(error);
					const _id = '_id-value';
					const test = new Test({ _id });
					test.transformDocumentToRecord = stub();
					try {
						await test.save();
						expect(false).toBe(true); // if save() doesn't reject then that is a failed test
					} catch (err) {
						const expected = {
							other: {
								foo: 'bar',
								filename,
								_id,
							},
						};

						expect(err).toMatchObject(expected);
					}
				});
			});
		});

		describe('instance setters', () => {
			test('should set the hidden __id property', () => {
				const Test = compileModel(connection, schema, 'foo');
				const test = new Test();
				test._id = 'foo';
				expect(test.__id).toBe('foo');
			});

			test('should disallow mutating the hidden __id property once set', () => {
				const Test = compileModel(connection, schema, 'foo');
				const test = new Test();
				test._id = 'foo';
				expect(() => {
					test._id = 'bar';
				}).toThrow();
				expect(test.__id).toBe('foo');
			});
		});
	});
});
