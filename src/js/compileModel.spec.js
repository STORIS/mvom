import { stub } from 'sinon';
import { mockLogger } from '#test/helpers';
import compileModel, { __RewireAPI__ as RewireAPI } from './compileModel';

describe('compileModel', () => {
	let connection;
	let schema;

	const transformRecordToDocument = stub();
	const transformPathsToDbPositions = stub();
	const validate = stub();
	class Document {
		_transformRecordToDocument = transformRecordToDocument;

		validate = validate;

		transformationErrors = [
			{ transformClass: 'class1', transformValue: 'value1' },
			{ transformClass: 'class2', transformValue: 'value2' },
		];
	}
	const executeDbFeature = stub();
	const queryConstructor = stub();
	const exec = stub();

	class DataValidationError extends Error {}
	class InvalidParameterError extends Error {}
	beforeAll(() => {
		class Connection {}
		RewireAPI.__Rewire__('Connection', Connection);
		connection = new Connection();
		connection.logger = mockLogger;
		connection.executeDbFeature = executeDbFeature;

		RewireAPI.__Rewire__('Document', Document);
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);

		class Query {
			exec = exec;

			constructor(Model, selectionCriteria, options) {
				queryConstructor(Model, selectionCriteria, options);
			}
		}
		RewireAPI.__Rewire__('Query', Query);

		class Schema {
			transformPathsToDbPositions = transformPathsToDbPositions;
		}
		RewireAPI.__Rewire__('Schema', Schema);
		schema = new Schema();

		RewireAPI.__Rewire__('DataValidationError', DataValidationError);
	});

	beforeEach(() => {
		executeDbFeature.reset();
		transformPathsToDbPositions.reset();
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
			describe('file with schema', () => {
				let Model;
				beforeAll(() => {
					Model = compileModel(connection, schema, 'foo');
				});

				describe('find', () => {
					beforeEach(() => {
						exec.resolves({ count: 5, documents: ['foo', 'bar'] });
					});

					test('should call the query constructor with the passed parameters', async () => {
						await Model.find('foo', 'bar');
						expect(queryConstructor.calledWith(Model, 'foo', 'bar')).toBe(true);
					});

					test('should return the results of the execution of the query', async () => {
						expect(await Model.find()).toEqual(['foo', 'bar']);
					});
				});

				describe('findAndCount', () => {
					beforeEach(() => {
						exec.resolves({ count: 5, documents: ['foo', 'bar'] });
					});

					test('should call the query constructor with the passed parameters', async () => {
						await Model.findAndCount('foo', 'bar');
						expect(queryConstructor.calledWith(Model, 'foo', 'bar')).toBe(true);
					});

					test('should return the results of the execution of the query', async () => {
						expect(await Model.findAndCount()).toEqual({ count: 5, documents: ['foo', 'bar'] });
					});
				});

				describe('readFileContentsById', () => {
					test('should return the Base64 string', async () => {
						const result = 'base64string';
						executeDbFeature.resolves({ result });
						expect(await Model.readFileContentsById()).toBe(result);
					});

					test('should return null if no result is returned', async () => {
						const result = null;
						executeDbFeature.resolves({ result });
						expect(await Model.readFileContentsById()).toBeNull();
					});
				});

				describe('makeModelFromDbResult', () => {
					test('should return an instance of the model', () => {
						expect(Model.makeModelFromDbResult()).toBeInstanceOf(Model);
					});

					test('should return an instance of the model with the passed id and version values', async () => {
						expect(
							await Model.makeModelFromDbResult({ record: 'foo', _id: 'bar', __v: 'baz' }),
						).toMatchObject({
							_id: 'bar',
							__id: 'bar',
							__v: 'baz',
						});
					});
				});

				describe('calls makeModelFromDbResult', () => {
					beforeAll(() => {
						stub(Model, 'makeModelFromDbResult');
					});

					afterAll(() => {
						Model.makeModelFromDbResult.restore();
					});

					beforeEach(() => {
						Model.makeModelFromDbResult.resetHistory();
					});

					describe('deleteById', () => {
						test('should call makeModelFromDbResult', async () => {
							const result = { record: 'foo', _id: 'bar', __v: 'baz' };
							executeDbFeature.resolves({ result });
							await Model.deleteById();
							expect(Model.makeModelFromDbResult.calledOnce).toBe(true);
							expect(Model.makeModelFromDbResult.calledWith(result)).toBe(true);
						});

						test('should return null if dbFeature resolves with null', async () => {
							executeDbFeature.resolves({ result: null });
							expect(await Model.deleteById()).toBeNull();
						});
					});

					describe('findById', () => {
						test('should call makeModelFromDbResult', async () => {
							const result = { record: 'foo', _id: 'bar', __v: 'baz' };
							executeDbFeature.resolves({ result });
							await Model.findById();
							expect(Model.makeModelFromDbResult.calledOnce).toBe(true);
							expect(Model.makeModelFromDbResult.calledWith(result)).toBe(true);
							expect(transformPathsToDbPositions.calledWith([])).toBe(true);
						});

						test('should return null if the dbFeature returns empty string (document not found)', async () => {
							executeDbFeature.resolves({ result: '' });
							expect(await Model.findById(1, { projection: ['projection1'] })).toBeNull();
							expect(transformPathsToDbPositions.calledWith(['projection1'])).toBe(true);
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
							await Model.findByIds(['id1', 'id2', 'id3']);
							expect(Model.makeModelFromDbResult.calledThrice).toBe(true);
							expect(Model.makeModelFromDbResult.firstCall.calledWith(result[0])).toBe(true);
							expect(Model.makeModelFromDbResult.secondCall.calledWith(result[1])).toBe(true);
							expect(Model.makeModelFromDbResult.thirdCall.calledWith(result[2])).toBe(true);
							expect(transformPathsToDbPositions.calledWith([])).toBe(true);
						});

						test('should call findByIds dbFeature with an array even if a single id is passed in', async () => {
							const result = [{ record: 'foo1', _id: 'bar1', __v: 'baz1' }];
							executeDbFeature.resolves({ result });
							transformPathsToDbPositions.returns([1]);
							await Model.findByIds('id1', { projection: ['projection1'] });
							expect(
								executeDbFeature.calledWith('findByIds', {
									filename: Model.file,
									ids: ['id1'],
									projection: [1],
								}),
							).toBe(true);
							expect(transformPathsToDbPositions.calledWith(['projection1'])).toBe(true);
						});

						test('should return an array with null values for each empty string passed back from the dbFeature', async () => {
							const expectedResult = [null, null, null];
							const dbResult = ['', '', ''];
							executeDbFeature.resolves({ result: dbResult });
							expect(await Model.findByIds(['id1', {}, []])).toEqual(expectedResult);
						});

						test('should throw an InvalidParameterError if no ids are passed in', async () => {
							await expect(Model.findByIds()).rejects.toThrow(InvalidParameterError);
						});
					});
				});
			});

			describe('schemaless file', () => {
				let Model;
				beforeEach(() => {
					Model = compileModel(connection, null, 'foo');
					stub(Model, 'makeModelFromDbResult');
				});

				describe('findByIds', () => {
					test('should skip transformPathsToDbPositions', async () => {
						const result = [{ record: ['foo1'], _id: 'bar1', __v: 'baz1' }];
						executeDbFeature.resolves({ result });
						await Model.findByIds('id1', { projection: ['projection1'] });
						expect(
							executeDbFeature.calledWith('findByIds', {
								filename: Model.file,
								ids: ['id1'],
								projection: [],
							}),
						).toBe(true);
						expect(transformPathsToDbPositions.callCount).toBe(0);
					});
				});

				describe('findById', () => {
					test('should skip transformPathsToDbPositions', async () => {
						const result = { record: ['foo1'], _id: 'bar1', __v: 'baz1' };
						executeDbFeature.resolves({ result });
						await Model.findById('id1', { projection: ['projection1'] });
						expect(
							executeDbFeature.calledWith('findById', {
								filename: Model.file,
								id: 'id1',
								projection: [],
							}),
						).toBe(true);
						expect(transformPathsToDbPositions.callCount).toBe(0);
					});
				});
			});
		});

		describe('constructor', () => {
			test('should instantiate a new instance of the class', () => {
				const Model = compileModel(connection, schema, 'foo');
				expect(new Model()).toBeInstanceOf(Model);
			});

			test('should set the expected instance properties', async () => {
				const Model = compileModel(connection, schema, 'foo');
				expect(new Model({ _id: 'bar', __v: 'baz' })).toMatchObject({
					_id: 'bar',
					__id: 'bar',
					__v: 'baz',
				});
			});

			test('should call the warn logger once for each transformation error added by the Document constructor', () => {
				const Model = compileModel(connection, schema, 'foo');
				new Model();
				expect(connection.logger.warn.calledTwice).toBe(true);
			});
		});

		describe('instance methods', () => {
			const filename = 'filename-value';
			let Model;
			beforeAll(() => {
				Model = compileModel(connection, schema, filename);
			});

			describe('save', () => {
				test('should throw an error if an _id has not been added to the instance', async () => {
					const test = new Model();
					await expect(test.save()).rejects.toThrow();
				});

				test('should throw DataValidationError if validate resolves with errors', async () => {
					validate.resolves({ foo: 'bar' });
					const test = new Model({ _id: 'foo' });
					await expect(test.save()).rejects.toThrow(DataValidationError);
				});

				test('should instantiate a new model instance with the results of the dbFeature execution', async () => {
					validate.resolves({});
					executeDbFeature.resolves({ result: { record: [], _id: 'bar', __v: 'baz' } });
					const test = new Model({ _id: 'foo' });
					test.transformDocumentToRecord = stub();
					test.buildForeignKeyDefinitions = stub();
					expect(await test.save()).toMatchObject({ _id: 'bar', __id: 'bar', __v: 'baz' });
				});

				test('should enrich and rethrow error if executeDbFeature rejects', async () => {
					validate.resolves({});
					const error = new Error();
					error.other = { foo: 'bar' };
					executeDbFeature.rejects(error);
					const _id = '_id-value';
					const test = new Model({ _id });
					test.transformDocumentToRecord = stub();
					test.buildForeignKeyDefinitions = stub();

					const expected = {
						other: {
							foo: 'bar',
							filename,
							_id,
						},
					};

					await expect(test.save()).rejects.toThrow(expect.objectContaining(expected));
				});
			});
		});

		describe('instance setters', () => {
			test('should set the hidden __id property', () => {
				const Model = compileModel(connection, schema, 'foo');
				const test = new Model();
				test._id = 'foo';
				expect(test.__id).toBe('foo');
			});

			test('should disallow mutating the hidden __id property once set', () => {
				const Model = compileModel(connection, schema, 'foo');
				const test = new Model();
				test._id = 'foo';
				expect(() => {
					test._id = 'bar';
				}).toThrow();
				expect(test.__id).toBe('foo');
			});
		});
	});
});
