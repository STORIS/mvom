/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import DocumentArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('DocumentArrayType', () => {
	const Schema = class {};
	before(() => {
		RewireAPI.__Rewire__('Schema', Schema);
	});

	after(() => {
		RewireAPI.__ResetDependency__('Schema');
	});

	describe('static methods', () => {
		describe('objArrayToArrayObj', () => {
			it('should transform an object with one property value of arrays', () => {
				assert.deepEqual(DocumentArrayType.objArrayToArrayObj({ propertyA: ['foo', 'bar'] }), [
					{ propertyA: 'foo' },
					{ propertyA: 'bar' },
				]);
			});

			it('should transform an object with more than one property value of arrays', () => {
				assert.deepEqual(
					DocumentArrayType.objArrayToArrayObj({
						propertyA: ['foo', 'bar'],
						propertyB: ['baz', 'qux'],
					}),
					[{ propertyA: 'foo', propertyB: 'baz' }, { propertyA: 'bar', propertyB: 'qux' }],
				);
			});

			it('should deeply transform an object with property values of arrays', () => {
				assert.deepEqual(
					DocumentArrayType.objArrayToArrayObj({
						propertyA: [{ propertyB: ['foo', 'bar'] }, { propertyB: ['baz', 'qux'] }],
					}),
					[
						{ propertyA: [{ propertyB: 'foo' }, { propertyB: 'bar' }] },
						{ propertyA: [{ propertyB: 'baz' }, { propertyB: 'qux' }] },
					],
				);
			});
		});
	});

	describe('constructor', () => {
		it('should throw when valueSchema is not an instance of Schema', () => {
			assert.throws(() => new DocumentArrayType('foo'));
		});

		it('should set _valueSchemaType instance member', () => {
			const documentArrayType = new DocumentArrayType(new Schema());
			assert.instanceOf(documentArrayType._valueSchema, Schema);
		});
	});

	describe('instance methods', () => {
		const Document = class {
			constructor(schema, record) {
				this._schema = schema;
				this._record = record;
			}
		};
		let objArrayToArrayObj;
		let documentArrayType;

		before(() => {
			RewireAPI.__Rewire__('Document', Document);
			objArrayToArrayObj = stub(DocumentArrayType, 'objArrayToArrayObj');
			documentArrayType = new DocumentArrayType(new Schema());
		});

		beforeEach(() => {
			objArrayToArrayObj.resetHistory();
		});

		after(() => {
			RewireAPI.__ResetDependency__('Document');
			objArrayToArrayObj.restore();
		});

		describe('get', () => {
			it('should call objArrayToArrayObj with result of new Document constructor using passed record', () => {
				documentArrayType.get('foo');
				assert.instanceOf(objArrayToArrayObj.args[0][0]._schema, Schema);
				assert.strictEqual(objArrayToArrayObj.args[0][0]._record, 'foo');
			});
		});
	});
});
