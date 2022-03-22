import { mockDeep } from 'jest-mock-extended';
import { getError, NoErrorThrownError } from '#test/helpers';
import compileModel from '../compileModel';
import type Connection from '../Connection';
import { DataValidationError } from '../errors';
import Schema from '../Schema';
import type { SchemaDefinition } from '../Schema';
import type { GenericObject } from '../types';

const connectionMock = mockDeep<Connection>();
const schemaDefinition: SchemaDefinition = {
	prop1: {
		type: 'string',
		path: 1,
		dictionary: 'prop1Dictionary',
		foreignKey: { file: 'FK_FILE', entityName: 'prop1' },
	},
	prop2: { type: 'number', path: 2, dictionary: 'prop2Dictionary' },
};
const schema = new Schema(schemaDefinition);
const filename = 'test.file';

describe('constructor', () => {
	test('should log transformation errors if encountered during construction', () => {
		const Model = compileModel(connectionMock, schema, filename);

		new Model({ record: [null, 'foo'] });

		expect(connectionMock.logMessage).toHaveBeenCalledWith('warn', expect.anything());
	});
});

describe('_id accessors', () => {
	test('should only allow _id to be set a single time', () => {
		const Model = compileModel(connectionMock, schema, filename);
		const model = new Model({ record: [] });

		model._id = 'test1';

		expect(() => {
			model._id = 'test2';
		}).toThrow(Error);
	});

	test('should return _id value after being set', () => {
		const Model = compileModel(connectionMock, schema, filename);
		const model = new Model({ record: [] });

		expect(model._id).toBeNull();

		model._id = 'test';
		expect(model._id).toBe('test');
	});

	test('_id should be enumerable on own properties of Model', () => {
		const Model = compileModel(connectionMock, schema, filename);
		const model = new Model({ record: [] });

		expect(Object.keys(model)).toContain('_id');
	});
});

describe('deleteById', () => {
	test('should return null if database returns null', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id = 'id';
		connectionMock.executeDbFeature.mockResolvedValue({ result: null });

		expect(await Model.deleteById(id)).toBeNull();
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('deleteById', { filename, id });
	});

	test('should return new model instance from returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id = 'id';
		const version = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id, __v: version, record: [] },
		});

		const model = (await Model.deleteById(id))!;
		expect(model).toBeInstanceOf(Model);
		expect(model._id).toBe(id);
		expect(model.__v).toBe(version);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('deleteById', { filename, id });
	});
});

describe('find', () => {
	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: [] },
				{ _id: id2, __v: version2, record: [] },
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('find', {
			filename,
			projection: [],
			queryCommand: `select ${filename}`,
		});
	});
});

describe('findAndCount', () => {
	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: [] },
				{ _id: id2, __v: version2, record: [] },
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('find', {
			filename,
			projection: [],
			queryCommand: `select ${filename}`,
		});
	});
});

describe('findById', () => {
	test('should return new model instance for returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: [] },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findById', {
			filename,
			id: id1,
			projection: [],
		});
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: ['attribute1', 'attribute2'] },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._raw).toEqual(['attribute1', 'attribute2']);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findById', {
			filename,
			id: id1,
			projection: [],
		});
	});

	test('should return null if database record is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: null,
		});

		const document = await Model.findById(id1);

		expect(document).toBeNull();
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findById', {
			filename,
			id: id1,
			projection: [],
		});
	});
});

describe('findByIds', () => {
	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: [] },
				{ _id: id2, __v: version2, record: [] },
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findByIds', {
			filename,
			ids: [id1, id2],
			projection: [],
		});
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: ['record1-attribute1', 'record1-attribute2'] },
				{ _id: id1, __v: version2, record: ['record2-attribute1', 'record2-attribute2'] },
			],
		});

		const documents = await Model.findByIds([id1, id2]);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;

		expect(document1!._raw).toEqual(['record1-attribute1', 'record1-attribute2']);
		expect(document2!._raw).toEqual(['record2-attribute1', 'record2-attribute2']);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findByIds', {
			filename,
			ids: [id1, id2],
			projection: [],
		});
	});

	test('should return null for each database record that is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: [null, { _id: id2, __v: version2, record: [] }],
		});

		const documents = await Model.findByIds([id1, id2]);

		const [document1, document2] = documents;
		expect(document1).toBeNull();
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('findByIds', {
			filename,
			ids: [id1, id2],
			projection: [],
		});
	});
});

describe('readFileContentsById', () => {
	test('should return string from database', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id1 = 'id1';
		const mockResult = 'RWFzdGVyIEVnZwo=';
		connectionMock.executeDbFeature.mockResolvedValue({ result: mockResult });

		const contents = await Model.readFileContentsById(id1);
		expect(contents).toBe(mockResult);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('readFileContentsById', {
			filename,
			id: id1,
		});
	});
});

describe('save', () => {
	test('should throw TypeError if _id is not set', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const model = new Model({ record: [] });

		await expect(model.save()).rejects.toThrow(TypeError);
	});

	test('should reject save if validation is not successful', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id = 'id';
		const model = new Model({ _id: id, data: { prop1: 'prop1-value' } });
		model.validate = () => Promise.resolve(new Map([['prop1', 'Not good']]));

		await expect(model.save()).rejects.toThrow(DataValidationError);
	});

	test('should save and return new model instance', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id = 'id';
		const version = '1';
		const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id, __v: version, record: ['prop1-value', 123] },
		});
		const result = await model.save();

		expect(result).toBeInstanceOf(Model);
		expect(result._id).toBe(id);
		expect(result.__v).toBe(version);
		expect(result.prop1).toBe('prop1-value');
		expect(result.prop2).toBe(123);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('save', {
			filename,
			id,
			__v: null,
			record: ['prop1-value', '123'],
			foreignKeyDefinitions: [
				{ entityIds: ['prop1-value'], entityName: 'prop1', filename: 'FK_FILE' },
			],
			clearAttributes: false,
		});
	});

	test('should catch, enrich, and rethrow errors returned from database operations', async () => {
		const Model = compileModel(connectionMock, schema, filename);

		const id = 'id';
		const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

		const err = new Error('Test error');
		connectionMock.executeDbFeature.mockRejectedValue(err);

		const error = await getError<Error & { other: GenericObject }>(async () => model.save());

		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeInstanceOf(Error);
		expect(error.other).toEqual({ filename, _id: id });
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith('save', {
			filename,
			id,
			__v: null,
			record: ['prop1-value', '123'],
			foreignKeyDefinitions: [
				{ entityIds: ['prop1-value'], entityName: 'prop1', filename: 'FK_FILE' },
			],
			clearAttributes: false,
		});
	});
});
