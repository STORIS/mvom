import { mockDeep } from 'jest-mock-extended';
import { getError, NoErrorThrownError } from '#test/helpers';
import mockDelimiters from '#test/mockDelimiters';
import type {
	ModelDeleteByIdOptions,
	ModelFindByIdOptions,
	ModelFindOptions,
	ModelReadFileContentsByIdOptions,
	ModelSaveOptions,
} from '../compileModel';
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

const { am, vm, svm } = mockDelimiters;

describe('constructor', () => {
	test('should log transformation errors if encountered during construction', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		new Model({ record: `${am}'foo'` });

		expect(connectionMock.logMessage).toHaveBeenCalledWith('warn', expect.anything());
	});
});

describe('_id accessors', () => {
	test('should only allow _id to be set a single time', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);
		const model = new Model({ record: '' });

		model._id = 'test1';

		expect(() => {
			model._id = 'test2';
		}).toThrow(Error);
	});

	test('should return _id value after being set', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);
		const model = new Model({ record: '' });

		expect(model._id).toBeNull();

		model._id = 'test';
		expect(model._id).toBe('test');
	});

	test('_id should be enumerable on own properties of Model', () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);
		const model = new Model({ record: '' });

		expect(Object.keys(model)).toContain('_id');
	});
});

describe('deleteById', () => {
	test('should return null if database returns null', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id = 'id';
		connectionMock.executeDbFeature.mockResolvedValue({ result: null });

		expect(await Model.deleteById(id)).toBeNull();
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			undefined,
		);
	});

	test('should return new model instance from returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id = 'id';
		const version = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id, __v: version, record: '' },
		});

		const model = (await Model.deleteById(id))!;
		expect(model).toBeInstanceOf(Model);
		expect(model._id).toBe(id);
		expect(model.__v).toBe(version);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			undefined,
		);
	});

	test('should should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id = 'id';
		connectionMock.executeDbFeature.mockResolvedValue({ result: null });

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelDeleteByIdOptions = { userDefined };
		expect(await Model.deleteById(id, options)).toBeNull();
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'deleteById',
			{ filename, id },
			{ userDefined },
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
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			undefined,
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelFindOptions = { userDefined };

		const documents = await Model.find({}, options);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1._id).toBe(id1);
		expect(document1.__v).toBe(version1);
		expect(document2._id).toBe(id2);
		expect(document2.__v).toBe(version2);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{ userDefined },
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
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			undefined,
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			count: 2,
			documents: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelFindOptions = { userDefined };

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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'find',
			{
				filename,
				projection: null,
				queryCommand: `select ${filename}`,
			},
			{ userDefined },
		);
	});
});

describe('findById', () => {
	test('should return new model instance for returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			undefined,
		);
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: `attribute1${am}attribute2` },
		});

		const document = await Model.findById(id1);

		expect(document).toBeInstanceOf(Model);
		expect(document!._raw).toEqual(['attribute1', 'attribute2']);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			undefined,
		);
	});

	test('should return null if database record is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: null,
		});

		const document = await Model.findById(id1);

		expect(document).toBeNull();
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			undefined,
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelFindByIdOptions = { userDefined };

		const document = await Model.findById(id1, options);

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: null,
			},
			{ userDefined },
		);
	});

	test('should provide projection if specified', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: { _id: id1, __v: version1, record: '' },
		});

		const projection = ['prop2'];
		const document = await Model.findById(id1, { projection });

		expect(document).toBeInstanceOf(Model);
		expect(document!._id).toBe(id1);
		expect(document!.__v).toBe(version1);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findById',
			{
				filename,
				id: id1,
				projection: [2],
			},
			undefined,
		);
	});
});

describe('findByIds', () => {
	test('should return new model instance for each returned database record', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			undefined,
		);
	});

	test('should return new model instance for returned database record when there is no schema', async () => {
		const Model = compileModel(connectionMock, null, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			undefined,
		);
	});

	test('should return null for each database record that is not found', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: [null, { _id: id2, __v: version2, record: '' }],
		});

		const documents = await Model.findByIds([id1, id2]);

		const [document1, document2] = documents;
		expect(document1).toBeNull();
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			undefined,
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
			result: [
				{ _id: id1, __v: version1, record: '' },
				{ _id: id2, __v: version2, record: '' },
			],
		});

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelFindByIdOptions = { userDefined };

		const documents = await Model.findByIds([id1, id2], options);
		documents.forEach((document) => {
			expect(document).toBeInstanceOf(Model);
		});

		const [document1, document2] = documents;
		expect(document1!._id).toBe(id1);
		expect(document1!.__v).toBe(version1);
		expect(document2!._id).toBe(id2);
		expect(document2!.__v).toBe(version2);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: null,
			},
			{ userDefined },
		);
	});

	test('should provide projection if specified', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const version1 = '1';
		const id2 = 'id2';
		const version2 = '2';
		connectionMock.executeDbFeature.mockResolvedValue({
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
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'findByIds',
			{
				filename,
				ids: [id1, id2],
				projection: [2],
			},
			undefined,
		);
	});
});

describe('readFileContentsById', () => {
	test('should return string from database', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const mockResult = 'RWFzdGVyIEVnZwo=';
		connectionMock.executeDbFeature.mockResolvedValue({ result: mockResult });

		const contents = await Model.readFileContentsById(id1);
		expect(contents).toBe(mockResult);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'readFileContentsById',
			{
				filename,
				id: id1,
			},
			undefined,
		);
	});

	test('should pass setup options', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id1 = 'id1';
		const mockResult = 'RWFzdGVyIEVnZwo=';
		connectionMock.executeDbFeature.mockResolvedValue({ result: mockResult });

		const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
		const options: ModelReadFileContentsByIdOptions = { userDefined };

		const contents = await Model.readFileContentsById(id1, options);
		expect(contents).toBe(mockResult);
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'readFileContentsById',
			{
				filename,
				id: id1,
			},
			{ userDefined },
		);
	});
});

describe('save', () => {
	test('should throw TypeError if _id is not set', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const model = new Model({ record: '' });

		await expect(model.save()).rejects.toThrow(TypeError);
	});

	test('should reject save if validation is not successful', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id = 'id';
		const model = new Model({ _id: id, data: { prop1: 'prop1-value' } });
		model.validate = () => Promise.resolve(new Map([['prop1', 'Not good']]));

		await expect(model.save()).rejects.toThrow(DataValidationError);
	});

	test('should catch, enrich, and rethrow errors returned from database operations', async () => {
		const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

		const id = 'id';
		const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

		const err = new Error('Test error');
		connectionMock.executeDbFeature.mockRejectedValue(err);

		const error = await getError<Error & { other: GenericObject }>(async () => model.save());

		expect(error).not.toBeInstanceOf(NoErrorThrownError);
		expect(error).toBeInstanceOf(Error);
		expect(error.other).toEqual({ filename, _id: id });
		expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
			'save',
			{
				filename,
				id,
				__v: null,
				record: `prop1-value${am}123`,
				foreignKeyDefinitions: [
					{ entityIds: ['prop1-value'], entityName: 'prop1', filename: 'FK_FILE' },
				],
			},
			undefined,
		);
	});

	describe('success', () => {
		test('should save and return new model instance with attribute based schemas', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			connectionMock.executeDbFeature.mockResolvedValue({
				result: { _id: id, __v: version, record: `prop1-value${am}123` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.prop1).toBe('prop1-value');
			expect(result.prop2).toBe(123);
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: 'FK_FILE' },
					],
				},
				undefined,
			);
		});

		test('should save and return new model instance with array based schemas', async () => {
			const arraySchema = new Schema({ arrayProp: [{ type: 'string', path: 1 }] });
			const Model = compileModel(connectionMock, arraySchema, filename, mockDelimiters);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { arrayProp: ['val1', 'val2'] } });

			connectionMock.executeDbFeature.mockResolvedValue({
				result: { _id: id, __v: version, record: `val1${vm}val2` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.arrayProp).toEqual(['val1', 'val2']);
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `val1${vm}val2`,
					foreignKeyDefinitions: [],
				},
				undefined,
			);
		});

		test('should save and return new model instance with array based schemas and sparse arrays', async () => {
			const arraySchema = new Schema({ arrayProp: [{ type: 'string', path: 1 }] });
			const Model = compileModel(connectionMock, arraySchema, filename, mockDelimiters);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { arrayProp: [null, 'val2'] } });

			connectionMock.executeDbFeature.mockResolvedValue({
				result: { _id: id, __v: version, record: `${vm}val2` },
			});
			const result = await model.save();

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.arrayProp).toEqual([null, 'val2']);
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `${vm}val2`,
					foreignKeyDefinitions: [],
				},
				undefined,
			);
		});

		test('should save and return new model instance with nested array based schemas', async () => {
			const arraySchema = new Schema({ nestedArrayProp: [[{ type: 'string', path: 1 }]] });
			const Model = compileModel(connectionMock, arraySchema, filename, mockDelimiters);

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

			connectionMock.executeDbFeature.mockResolvedValue({
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
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `val1-subVal1${svm}val1-subVal2${vm}val2-subVal1${svm}val2-subVal2`,
					foreignKeyDefinitions: [],
				},
				undefined,
			);
		});

		test('should save and return new model instance with nested array based schemas and sparse arrays', async () => {
			const arraySchema = new Schema({ nestedArrayProp: [[{ type: 'string', path: 1 }]] });
			const Model = compileModel(connectionMock, arraySchema, filename, mockDelimiters);

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

			connectionMock.executeDbFeature.mockResolvedValue({
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
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `${svm}val1-subVal2${vm}val2-subVal1${svm}`,
					foreignKeyDefinitions: [],
				},
				undefined,
			);
		});

		test('should pass setup options', async () => {
			const Model = compileModel(connectionMock, schema, filename, mockDelimiters);

			const id = 'id';
			const version = '1';
			const model = new Model({ _id: id, data: { prop1: 'prop1-value', prop2: 123 } });

			connectionMock.executeDbFeature.mockResolvedValue({
				result: { _id: id, __v: version, record: `prop1-value${am}123` },
			});

			const userDefined = { option1: 'foo', option2: 'bar', option3: 'baz' };
			const options: ModelSaveOptions = { userDefined };

			const result = await model.save(options);

			expect(result).toBeInstanceOf(Model);
			expect(result._id).toBe(id);
			expect(result.__v).toBe(version);
			expect(result.prop1).toBe('prop1-value');
			expect(result.prop2).toBe(123);
			expect(connectionMock.executeDbFeature).toHaveBeenCalledWith(
				'save',
				{
					filename,
					id,
					__v: null,
					record: `prop1-value${am}123`,
					foreignKeyDefinitions: [
						{ entityIds: ['prop1-value'], entityName: 'prop1', filename: 'FK_FILE' },
					],
				},
				{ userDefined },
			);
		});
	});
});
