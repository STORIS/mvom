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
		let documentArrayType;

		before(() => {
			RewireAPI.__Rewire__('Document', Document);
			documentArrayType = new DocumentArrayType(new Schema());
		});

		after(() => {
			RewireAPI.__ResetDependency__('Document');
		});

		describe('get', () => {
			before(() => {
				stub(documentArrayType, '_makeSubDocument').returns(['foo', 'bar']);
			});

			after(() => {
				documentArrayType._makeSubDocument.restore();
			});

			it('should return result of makeSubDocument generator', () => {
				assert.deepEqual(documentArrayType.get(), ['foo', 'bar']);
			});
		});

		describe('_makeSubDocument', () => {
			it('should return a new document instance from the first subrecord when yielding', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.deepEqual(value._record, ['foo', 'baz']);
			});

			it('should return a new document instance from the second subrecord when yielding a second time', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.deepEqual(value._record, ['bar', 'qux']);
			});

			it('should return as done when no subrecord is possible at iteration position', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				it.next();
				const { done } = it.next();
				assert.isTrue(done);
			});
		});
	});
});
