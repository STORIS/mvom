/* eslint-disable no-underscore-dangle */
import { castArray } from 'lodash';
import { spy, stub } from 'sinon';
import SimpleType from './SimpleType';
/* eslint-disable-next-line import/named */
import NestedArrayType, { __RewireAPI__ as RewireAPI } from './NestedArrayType';

describe('NestedArrayType', () => {
	const SimpleTypeExtended = class extends SimpleType {
		getFromMvData = stub();

		setIntoMvData = stub();

		transformFromDb = stub();

		transformToDb = stub();

		transformForeignKeyDefinitionsToDb = stub();

		validate = stub();

		definition = {};
	};

	describe('instance methods', () => {
		describe('get', () => {
			const castArraySpy = spy(castArray);
			let simpleType;
			let nestedArrayType;
			beforeAll(() => {
				RewireAPI.__Rewire__('castArray', castArraySpy);
				simpleType = new SimpleTypeExtended({});
				simpleType.transformFromDb.withArgs('foo').returns('def');
				simpleType.transformFromDb.withArgs('bar').returns('henk');
				simpleType.transformFromDb.withArgs('baz').returns('mos');
				simpleType.transformFromDb.withArgs('qux').returns('thud');
				nestedArrayType = new NestedArrayType(simpleType);
			});

			beforeEach(() => {
				castArraySpy.resetHistory();
				simpleType.getFromMvData.reset();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('castArray');
			});

			test('should return an empty array when given undefined', () => {
				simpleType.getFromMvData.returns(undefined);
				expect(nestedArrayType.get()).toEqual([]);
			});

			test('should return a transformed nested array when given a primitive value ', () => {
				simpleType.getFromMvData.returns('foo');
				expect(nestedArrayType.get()).toEqual([['def']]);
			});

			test('should return a transformed nested array when given an unnested array of length 1', () => {
				simpleType.getFromMvData.returns(['foo']);
				expect(nestedArrayType.get()).toEqual([['def']]);
			});

			test('should return a transformed nested array when given an unnested array of greater than 1', () => {
				simpleType.getFromMvData.returns(['foo', 'bar']);
				expect(nestedArrayType.get()).toEqual([['def'], ['henk']]);
			});

			test('should return a transformed nested array when given a single nested array', () => {
				simpleType.getFromMvData.returns([['foo', 'bar']]);
				expect(nestedArrayType.get()).toEqual([['def', 'henk']]);
			});

			test('should return a transformed nested array when given more than one nested array', () => {
				simpleType.getFromMvData.returns([
					['foo', 'bar'],
					['baz', 'qux'],
				]);
				expect(nestedArrayType.get()).toEqual([
					['def', 'henk'],
					['mos', 'thud'],
				]);
			});
		});

		describe('set', () => {
			let simpleType;
			let nestedArrayType;
			beforeAll(() => {
				simpleType = new SimpleTypeExtended({});
				simpleType.transformToDb.withArgs('foo').returns('def');
				simpleType.transformToDb.withArgs('bar').returns('henk');
				simpleType.transformToDb.withArgs('baz').returns('mos');
				simpleType.transformToDb.withArgs('qux').returns('thud');
				nestedArrayType = new NestedArrayType(simpleType);
			});

			beforeEach(() => {
				simpleType.setIntoMvData.reset();
				simpleType.transformToDb.resetHistory();
			});

			test('should call transformToDb with each nested array value passed', () => {
				nestedArrayType.set(
					[],
					[
						['foo', 'bar'],
						['baz', 'qux'],
					],
				);
				expect(simpleType.transformToDb.args[0][0]).toBe('foo');
				expect(simpleType.transformToDb.args[1][0]).toBe('bar');
				expect(simpleType.transformToDb.args[2][0]).toBe('baz');
				expect(simpleType.transformToDb.args[3][0]).toBe('qux');
			});

			test('should call setIntoMvData with results of transformToDb call', () => {
				nestedArrayType.set(
					[],
					[
						['foo', 'bar'],
						['baz', 'qux'],
					],
				);
				expect(simpleType.setIntoMvData.args[0][1]).toEqual([
					['def', 'henk'],
					['mos', 'thud'],
				]);
			});

			test('should return value returned from setIntoMvData', () => {
				simpleType.setIntoMvData.returns('foo');
				expect(nestedArrayType.set([], [[]])).toBe('foo');
			});
		});

		describe('transformForeignKeyDefinitionsToDb', () => {
			let simpleType;
			let nestedArrayType;
			beforeAll(() => {
				simpleType = new SimpleTypeExtended({});
				simpleType.transformForeignKeyDefinitionsToDb.withArgs('foo').returns(['foo']);
				simpleType.transformForeignKeyDefinitionsToDb.withArgs('bar').returns(['bar']);
				simpleType.transformForeignKeyDefinitionsToDb.withArgs('baz').returns(['baz']);
				simpleType.transformForeignKeyDefinitionsToDb.withArgs('qux').returns(['qux']);
				simpleType.transformForeignKeyDefinitionsToDb.withArgs(null).returns([]);
				nestedArrayType = new NestedArrayType(simpleType);
			});

			beforeEach(() => {
				simpleType.transformForeignKeyDefinitionsToDb.resetHistory();
			});

			test('should return a single level array of values returned from transformForeignKeyDefinitionsToDb', () => {
				const expected = ['foo', 'bar', 'baz', 'qux'];
				expect(
					nestedArrayType.transformForeignKeyDefinitionsToDb([
						['foo', 'bar', 'baz'],
						[],
						['qux', null],
					]),
				).toEqual(expected);
			});
		});

		describe('validate', () => {
			let simpleType;
			let nestedArrayType;
			const fooValidator = stub();
			const barValidator = stub();
			beforeAll(() => {
				simpleType = new SimpleTypeExtended({});
				nestedArrayType = new NestedArrayType(simpleType);
				nestedArrayType._validators.push({ validator: fooValidator, message: 'foo' });
				nestedArrayType._validators.push({ validator: barValidator, message: 'bar' });
			});

			beforeEach(() => {
				simpleType.validate.reset();
				fooValidator.reset();
				barValidator.reset();
			});

			test('should return an array of errors from multiple validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				simpleType.validate.resolves([]);
				expect(await nestedArrayType.validate([])).toEqual(['foo', 'bar']);
			});

			test('should return an array of errors from simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				simpleType.validate.resolves(['baz', 'qux']);
				expect(await nestedArrayType.validate(['value1'])).toEqual(['baz', 'qux']);
			});

			test('should return an array of errors from multiple calls into the simpleType validator', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				expect(await nestedArrayType.validate([['value1'], ['value2']])).toEqual([
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an array of errors from multiple calls into the simpleType validator from nested array elements', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				simpleType.validate.onCall(2).resolves(['uier', 'grault']);
				simpleType.validate.onCall(3).resolves(['garply', 'waldo']);
				expect(
					await nestedArrayType.validate([
						['value1', 'value2'],
						['value3', 'value4'],
					]),
				).toEqual(['baz', 'qux', 'quux', 'corge', 'uier', 'grault', 'garply', 'waldo']);
			});

			test('should return an array of errors from all validators', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves(['quux', 'corge']);
				expect(await nestedArrayType.validate([['value1'], ['value2']])).toEqual([
					'foo',
					'bar',
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an array of errors from all validators when a simpleType validator returns no errors', async () => {
				fooValidator.resolves(false);
				barValidator.resolves(false);
				simpleType.validate.onCall(0).resolves(['baz', 'qux']);
				simpleType.validate.onCall(1).resolves([]);
				simpleType.validate.onCall(2).resolves(['quux', 'corge']);
				expect(await nestedArrayType.validate([['value1'], ['value2', 'value3']])).toEqual([
					'foo',
					'bar',
					'baz',
					'qux',
					'quux',
					'corge',
				]);
			});

			test('should return an empty array if no errors are found', async () => {
				fooValidator.resolves(true);
				barValidator.resolves(true);
				simpleType.validate.resolves([]);
				expect(await nestedArrayType.validate([])).toEqual([]);
			});
		});
	});
});
