import { mock, mockDeep } from 'jest-mock-extended';
import { getError, NoErrorThrownError } from '#test/helpers';
import mockDelimiters from '#test/mockDelimiters';
import type {
	IncrementOperation,
	ModelDeleteByIdOptions,
	ModelFindByIdOptions,
	ModelFindOptions,
	ModelReadFileContentsByIdOptions,
	ModelSaveOptions,
} from '../compileModel';
import compileModel from '../compileModel';
import type Connection from '../Connection';
import { DataValidationError } from '../errors';
import type LogHandler from '../LogHandler';
import Schema from '../Schema';
import type { SchemaDefinition } from '../Schema';
import type { Equals, MvRecord } from '../types';

const connectionMock = mockDeep<Connection>();
const logHandlerMock = mock<LogHandler>();
const schemaDefinition = {
	prop1: {
		type: 'string',
		path: 1,
		dictionary: 'prop1Dictionary',
		foreignKey: { file: 'FK_FILE', entityName: 'prop1' },
	},
	prop2: { type: 'number', path: 2, dictionary: 'prop2Dictionary' },
} satisfies SchemaDefinition;
const schema = new Schema(schemaDefinition);
const filename = 'test.file';
const requestId = 'requestId';

const { am, vm, svm } = mockDelimiters;

describe('constructor', () => {
	test('should log transformation errors if encountered during construction', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		new Model({ record: `${am}'foo'` });

		expect(logHandlerMock.warn).toHaveBeenCalledTimes(1);
	});
});

describe('_id accessors', () => {
	test('should only allow _id to be set a single time', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
		const model = new Model({ record: '' });

		model._id = 'test1';

		expect(() => {
			model._id = 'test2';
		}).toThrow(Error);
	});

	test('should return _id value after being set', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
		const model = new Model({ record: '' });

		expect(model._id).toBeNull();

		model._id = 'test';
		expect(model._id).toBe('test');
	});

	test('_id should be enumerable on own properties of Model', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
		const model = new Model({ record: '' });

		expect(Object.keys(model)).toContain('_id');
	});
});

describe('deleteById', () => {
	test('should return null if database returns null', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id = 'id';
		connectionMock.executeDbSubroutine.mockResolvedValue({ result: null });

		expect(await Model.deleteById(id)).toBeNull();
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			{},
		);
	});

	test('should return new model instance from returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id = 'id';
		const version = '1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: id, __v: version, record: '' },
		});

		const model = (await Model.deleteById(id))!;
		expect(model).toBeInstanceOf(Model);
		expect(model._id).toBe(id);
		expect(model.__v).toBe(version);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			{},
		);
	});

	test('should should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id = 'id';
		connectionMock.executeDbSubroutine.mockResolvedValue({ result: null });

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelDeleteByIdOptions = { userDefined, maxReturnPayloadSize, requestId };
		expect(await Model.deleteById(id, options)).toBeNull();
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			{ userDefined, maxReturnPayloadSize, requestId },
		);
	});
});

describe('find', () => {
	beforeEach(() => {
		connectionMock.getDbLimits.mockResolvedValue({
			maxSort: 20,
			maxWith: 512,
			maxSentenceLength: 9247,
		});
	});

	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const documents = await Model.find();
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1._id).toBe(id1);
		expect(document1.__v).toBe(version1);
		expect(document2._id).toBe(id2);
		expect(document2.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{},
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelFindOptions<typeof schema> = {
			maxReturnPayloadSize,
			userDefined,
			requestId,
		};

		const documents = await Model.find({}, options);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1._id).toBe(id1);
		expect(document1.__v).toBe(version1);
		expect(document2._id).toBe(id2);
		expect(document2.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{ maxReturnPayloadSize, userDefined, requestId },
		);
	});
});

describe('findAndCount', () => {
	beforeEach(() => {
		connectionMock.getDbLimits.mockResolvedValue({
			maxSort: 20,
			maxWith: 512,
			maxSentenceLength: 9247,
		});
	});

	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const { count, documents } = await Model.findAndCount();
		expect(count).toBe(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1._id).toBe(id1);
		expect(document1.__v).toBe(version1);
		expect(document2._id).toBe(id2);
		expect(document2.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{},
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelFindOptions<typeof schema> = {
			maxReturnPayloadSize,
			userDefined,
			requestId,
		};

		const { count, documents } = await Model.findAndCount({}, options);
		expect(count).toBe(2);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1._id).toBe(id1);
		expect(document1.__v).toBe(version1);
		expect(document2._id).toBe(id2);
		expect(document2.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{ maxReturnPayloadSize, userDefined, requestId },
		);
	});
});

describe('findById', () => {
	test('should return new model instance for returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			{},
		);
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: id1, __v: version1, record: `attribute1${am}attribute2` },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._raw).toEqual(['attribute1', 'attribute2']);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			{},
		);
	});

	test('should return null if database record is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: null,
		});

		const document = await Model.findById(id1);

		expect(document).toBeNull();
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			{},
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelFindByIdOptions = { maxReturnPayloadSize, userDefined, requestId };

		const document = await Model.findById(id1, options);

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			{ maxReturnPayloadSize, userDefined, requestId },
		);
	});

	test('should provide projection if specified', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const projection = ['prop2'];
		const document = await Model.findById(id1, { projection });

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: [2],
			},
			{},
		);
	});
});

describe('findByIds', () => {
	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const documents = await Model.findByIds([id1, id2]);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1!._id).toBe(id1);
		expect(document1!.__v).toBe(version1);
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			{},
		);
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: `record1-attribute1${am}record1-attribute2` },
				{ _id: id1, __v: version2, record: `record2-attribute1${am}record2-attribute2` },
			],
		});

		const documents = await Model.findByIds([id1, id2]);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;

		expect(document1!._raw).toEqual(['record1-attribute1', 'record1-attribute2']);
		expect(document2!._raw).toEqual(['record2-attribute1', 'record2-attribute2']);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			{},
		);
	});

	test('should return null for each database record that is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: [null, { _id: id2, __v: version2, record: '' }],
		});

		const documents = await Model.findByIds([id1, id2]);

		const [document1, document2] = documents;
		expect(document1).toBeNull();
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			{},
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelFindByIdOptions = { maxReturnPayloadSize, userDefined, requestId };

		const documents = await Model.findByIds([id1, id2], options);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1!._id).toBe(id1);
		expect(document1!.__v).toBe(version1);
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			{ maxReturnPayloadSize, userDefined, requestId },
		);
	});

	test('should provide projection if specified', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const projection = ['prop2'];
		const documents = await Model.findByIds([id1, id2], { projection });
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1!._id).toBe(id1);
		expect(document1!.__v).toBe(version1);
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: [2],
			},
			{},
		);
	});
});

describe('increment', () => {
	const testSchemaDefinition = {
		prop1: { type: 'number', path: 1, dictionary: 'prop1Dictionary' },
		prop2: {
			type: 'string',
			path: 2,
			dictionary: 'prop1Dictionary',
			foreignKey: { file: 'FK_FILE', entityName: 'prop1' },
		},
		nestedDocument: {
			prop3: { type: 'number', path: 3 },
		},
	} satisfies SchemaDefinition;

	const testSchema = new Schema(testSchemaDefinition);

	test('should transform key paths to ordinal positions based on IncrementOperations passed in', async () => {
		const Model = compileModel(
			connectionMock,
			testSchema,
			filename,
			mockDelimiters,
			logHandlerMock,
		);
		connectionMock.executeDbSubroutine.mockResolvedValue({
			originalDocument: { _id: 'id', __v: 'version1', record: '' },
			updatedDocument: { _id: 'id', __v: 'version2', record: '' },
		});
		await Model.increment('id', [{ path: 'prop1', value: 3 }]);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'increment',
			{
				filename,
				id: 'id',
				operations: [{ path: '1.1.1', value: 3 }],
				retry: 5,
				retryDelay: 1,
			},
			{},
		);
	});

	test('should throw error if schema is not defined', async () => {
		const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
		connectionMock.executeDbSubroutine.mockResolvedValue({
			result: { _id: 'id', __v: 'version1', record: '' },
		});
		// @ts-expect-error: intentionally invalid data to trigger error due to no schema being defined
		await expect(Model.increment('id', [{ path: 'prop1', value: 3 }])).rejects.toThrow(Error);
		expect(connectionMock.executeDbSubroutine).not.toHaveBeenCalled();
	});

	test('should return both the original and updated document', async () => {
		const Model = compileModel(
			connectionMock,
			testSchema,
			filename,
			mockDelimiters,
			logHandlerMock,
		);
		connectionMock.executeDbSubroutine.mockResolvedValue({
			originalDocument: { _id: 'id', __v: 'version1', record: '1' },
			updatedDocument: { _id: 'id', __v: 'version2', record: '4' },
		});
		const { originalDocument, updatedDocument } = await Model.increment('id', [
			{ path: 'prop1', value: 3 },
		]);
		expect(originalDocument).toBeInstanceOf(Model);
		expect(originalDocument._id).toBe('id');
		expect(originalDocument.__v).toBe('version1');
		expect(originalDocument.prop1).toBe(1);
		expect(updatedDocument).toBeInstanceOf(Model);
		expect(updatedDocument._id).toBe('id');
		expect(updatedDocument.__v).toBe('version2');
		expect(updatedDocument.prop1).toBe(4);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'increment',
			{
				filename,
				id: 'id',
				operations: [{ path: '1.1.1', value: 3 }],
				retry: 5,
				retryDelay: 1,
			},
			{},
		);
	});
});

describe('readFileContentsById', () => {
	test('should return string from database', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const mockResult = 'RWFzdGVyIEVnZwo=';
		connectionMock.executeDbSubroutine.mockResolvedValue({ result: mockResult });

		const contents = await Model.readFileContentsById(id1);
		expect(contents).toBe(mockResult);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'readFileContentsById',
			{
				filename,
				id: id1,
			},
			{},
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

		const id1 = 'id1';
		const mockResult = 'RWFzdGVyIEVnZwo=';
		connectionMock.executeDbSubroutine.mockResolvedValue({ result: mockResult });

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const maxReturnPayloadSize = 10_000;
		const options: ModelReadFileContentsByIdOptions = {
			maxReturnPayloadSize,
			userDefined,
			requestId,
		};

		const contents = await Model.readFileContentsById(id1, options);
		expect(contents).toBe(mockResult);
		expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
			'readFileContentsById',
			{
				filename,
				id: id1,
			},
			{ maxReturnPayloadSize, userDefined, requestId },
		);
	});
});

describe('save', () => {
	describe('errors', () => {
		test('should throw TypeError if _id is not set', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

			const model = new Model({ record: '' });

			await expect(model.save()).rejects.toThrow(TypeError);
		});

		test('should reject save if validation is not successful', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

			const id = 'id';
			// @ts-expect-error: intentionally invalid data to trigger validation failure
			const model = new Model({ _id: id, data: { prop1: 'prop1', prop2: 'not-a-number-bad' } });

			await expect(model.save()).rejects.toThrow(DataValidationError);
		});

		test('should reject save if _id validation is not successful', async () => {
			const idSchema = new Schema(schemaDefinition, { idMatch: /^valid-id$/ });
			const Model = compileModel(
				connectionMock,
				idSchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'invalid-id';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			await expect(model.save()).rejects.toThrow(DataValidationError);
		});

		test('should catch, enrich, and rethrow errors returned from database operations', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

			const id = 'id';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			const err = new Error('Test error');
			connectionMock.executeDbSubroutine.mockRejectedValue(err);

			const error = await getError<Error & { other: unknown }>(async () => model.save());

			expect(error).not.toBeInstanceOf(NoErrorThrownError);
			expect(error).toBeInstanceOf(Error);
			expect(error.other).toEqual({ filename, _id: id });
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: ['FK_FILE'] },
					],
				},
				{},
			);
		});
	});

	describe('success', () => {
		test('should save and return new model instance with attribute based schemas', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: { _id: id, __v: version, record: `prop1-value${am}123` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.prop1).toBe('prop1-value');
			expect(result.prop2).toBe(123);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: ['FK_FILE'] },
					],
				},
				{},
			);
		});

		test('should save and return new model instance with array based schemas', async () => {
			const arraySchema = new Schema({ arrayProp: [{ type: 'string', path: 1 }] });
			const Model = compileModel(
				connectionMock,
				arraySchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { arrayProp: ['val1', 'val2'] } });

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: { _id: id, __v: version, record: `val1${vm}val2` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.arrayProp).toEqual(['val1', 'val2']);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `val1${vm}val2`,
					foreignKeyDefinitions: [],
				},
				{},
			);
		});

		test('should save and return new model instance with array based schemas and sparse arrays', async () => {
			const arraySchema = new Schema({ arrayProp: [{ type: 'string', path: 1 }] });
			const Model = compileModel(
				connectionMock,
				arraySchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { arrayProp: [null, 'val2'] } });

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: { _id: id, __v: version, record: `${vm}val2` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.arrayProp).toEqual([null, 'val2']);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `${vm}val2`,
					foreignKeyDefinitions: [],
				},
				{},
			);
		});

		test('should save and return new model instance with nested array based schemas', async () => {
			const arraySchema = new Schema({ nestedArrayProp: [[{ type: 'string', path: 1 }]] });
			const Model = compileModel(
				connectionMock,
				arraySchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'id';
			const version = '1';
			const model = new Model({
				_id: id,
				data: {
					nestedArrayProp: [
						['val1-subVal1', 'val1-subVal2'],
						['val2-subVal1', 'val2-subVal2'],
					],
				},
			});

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: {
					_id: id,
					__v: version,
					record: `val1-subVal1${svm}val1-subVal2${vm}val2-subVal1${svm}val2-subVal2`,
				},
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.nestedArrayProp).toEqual([
				['val1-subVal1', 'val1-subVal2'],
				['val2-subVal1', 'val2-subVal2'],
			]);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `val1-subVal1${svm}val1-subVal2${vm}val2-subVal1${svm}val2-subVal2`,
					foreignKeyDefinitions: [],
				},
				{},
			);
		});

		test('should save and return new model instance with nested array based schemas and sparse arrays', async () => {
			const arraySchema = new Schema({ nestedArrayProp: [[{ type: 'string', path: 1 }]] });
			const Model = compileModel(
				connectionMock,
				arraySchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'id';
			const version = '1';
			const model = new Model({
				_id: id,
				data: {
					nestedArrayProp: [
						[null, 'val1-subVal2'],
						['val2-subVal1', null],
					],
				},
			});

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: {
					_id: id,
					__v: version,
					record: `${svm}val1-subVal2${vm}val2-subVal1${svm}`,
				},
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.nestedArrayProp).toEqual([
				[null, 'val1-subVal2'],
				['val2-subVal1', null],
			]);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `${svm}val1-subVal2${vm}val2-subVal1${svm}`,
					foreignKeyDefinitions: [],
				},
				{},
			);
		});

		test('should pass setup options', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: { _id: id, __v: version, record: `prop1-value${am}123` },
			});

			const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
			const maxReturnPayloadSize = 10_000;
			const options: ModelSaveOptions = { maxReturnPayloadSize, userDefined, requestId };

			const result = await model.save(options);

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.prop1).toBe('prop1-value');
			expect(result.prop2).toBe(123);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: ['FK_FILE'] },
					],
				},
				{ maxReturnPayloadSize, userDefined, requestId },
			);
		});

		test('should save and return new model instance with valid id pattern match', async () => {
			const idSchema = new Schema(schemaDefinition, { idMatch: /^valid-id$/ });
			const Model = compileModel(
				connectionMock,
				idSchema,
				filename,
				mockDelimiters,
				logHandlerMock,
			);

			const id = 'valid-id';
			const version = '1';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			connectionMock.executeDbSubroutine.mockResolvedValue({
				result: { _id: id, __v: version, record: `prop1-value${am}123` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.prop1).toBe('prop1-value');
			expect(result.prop2).toBe(123);
			expect(connectionMock.executeDbSubroutine).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: ['FK_FILE'] },
					],
				},
				{},
			);
		});
	});
});

describe('type inference', () => {
	describe('with schema', () => {
		test('deleteById', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.deleteById>>>;

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});

		test('find', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<typeof Model.find>>[0];

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});

		test('findAndCount', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<typeof Model.findAndCount>>['documents'][0];

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});

		test('findById', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.findById>>>;

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});

		test('findByIds', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.findByIds>>[0]>;

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});

		test('save', () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<InstanceType<typeof Model>['save']>>;

			// prop1 should be string | null
			const test1: Equals<Result['prop1'], string | null> = true;
			expect(test1).toBe(true);

			// prop2 should be number | null
			const test2: Equals<Result['prop2'], number | null> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['_id'], string> = true;
			expect(test3).toBe(true);

			const test4: Equals<Result['__v'], string> = true;
			expect(test4).toBe(true);

			// _raw should be never since there is a schema
			const test5: Equals<Result['_raw'], never> = true;
			expect(test5).toBe(true);

			// any other property should be unknown
			const test6: Equals<Result['otherProp'], unknown> = true;
			expect(test6).toBe(true);
		});
	});

	describe('without schema', () => {
		test('deleteById', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.deleteById>>>;

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});

		test('find', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<typeof Model.find>>[0];

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});

		test('findAndCount', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<typeof Model.findAndCount>>['documents'][0];

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});

		test('findById', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.findById>>>;

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});

		test('findByIds', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = NonNullable<Awaited<ReturnType<typeof Model.findByIds>>[0]>;

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});

		test('save', () => {
			const Model = compileModel(connectionMock, null, filename, mockDelimiters, logHandlerMock);
			type Result = Awaited<ReturnType<InstanceType<typeof Model>['save']>>;

			// _raw should be MvRecord since there is no schema
			const test1: Equals<Result['_raw'], MvRecord> = true;
			expect(test1).toBe(true);

			const test2: Equals<Result['_id'], string> = true;
			expect(test2).toBe(true);

			const test3: Equals<Result['__v'], string> = true;
			expect(test3).toBe(true);

			// any other property should be unknown
			const test4: Equals<Result['otherProp'], unknown> = true;
			expect(test4).toBe(true);
		});
	});
});

describe('utility types', () => {
	describe('IncrementOperation', () => {
		test('should include number and embedded number types in path', () => {
			const incrementSchema = new Schema({
				boolean: { type: 'boolean', path: '1' },
				string: { type: 'string', path: '2' },
				number: { type: 'number', path: '3' },
				isoCalendarDate: { type: 'ISOCalendarDate', path: '4' },
				isoTime: { type: 'ISOTime', path: '5' },
				isoCalendarDateTime: { type: 'ISOCalendarDateTime', path: '6' },
				arrayNumber: [{ type: 'number', path: '7' }],
				nestedArrayNumber: [[{ type: 'string', path: '8' }]],
				schema: new Schema({
					boolean: { type: 'boolean', path: '9' },
					string: { type: 'string', path: '10' },
					number: { type: 'number', path: '11' },
					isoCalendarDate: { type: 'ISOCalendarDate', path: '12' },
					isoTime: { type: 'ISOTime', path: '13' },
					isoCalendarDateTime: { type: 'ISOCalendarDateTime', path: '14' },
					arrayNumber: [{ type: 'number', path: '15' }],
					nestedArrayNumber: [[{ type: 'string', path: '16' }]],
				}),
				embedded: {
					boolean: { type: 'boolean', path: '17' },
					string: { type: 'string', path: '18' },
					number: { type: 'number', path: '19' },
					isoCalendarDate: { type: 'ISOCalendarDate', path: '20' },
					isoTime: { type: 'ISOTime', path: '21' },
					isoCalendarDateTime: { type: 'ISOCalendarDateTime', path: '22' },
					arrayNumber: [{ type: 'number', path: '23' }],
					nestedArrayNumber: [[{ type: 'string', path: '24' }]],
				},
				documentArray: [
					{
						boolean: { type: 'boolean', path: '25' },
						string: { type: 'string', path: '26' },
						number: { type: 'number', path: '27' },
						isoCalendarDate: { type: 'ISOCalendarDate', path: '28' },
						isoTime: { type: 'ISOTime', path: '29' },
						isoCalendarDateTime: { type: 'ISOCalendarDateTime', path: '30' },
						arrayNumber: [{ type: 'number', path: '31' }],
					},
				],
				documentArraySchema: [
					new Schema({
						boolean: { type: 'boolean', path: '32' },
						string: { type: 'string', path: '33' },
						number: { type: 'number', path: '34' },
						isoCalendarDate: { type: 'ISOCalendarDate', path: '35' },
						isoTime: { type: 'ISOTime', path: '36' },
						isoCalendarDateTime: { type: 'ISOCalendarDateTime', path: '37' },
						arrayNumber: [{ type: 'number', path: '38' }],
					}),
				],
			});

			const test1: Equals<
				IncrementOperation<typeof incrementSchema>,
				{
					path: 'number' | 'schema.number' | 'embedded.number';
					value: number;
				}
			> = true;

			expect(test1).toBe(true);
		});
	});
});
