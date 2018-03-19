/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import DocumentArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('DocumentArrayType', () => {
	const Schema = class {
		getMvPaths = stub().returns([0, 1]);
	};
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
			constructor(schema, record, options) {
				this._schema = schema;
				this._record = record;
				this._isSubdocument = options.isSubdocument;
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

		describe('set', () => {
			it('should return an array of arrays based on what is returned from transformDocumentToRecord', () => {
				const transformDocumentToRecord = stub().returns(['foo', 'bar']);
				assert.deepEqual(documentArrayType.set([], [{ transformDocumentToRecord }]), [
					['foo'],
					['bar'],
				]);
			});

			it('should return an array of arrays with multiple items if multiple subdocuments are passed', () => {
				const transformDocumentToRecord = stub();
				transformDocumentToRecord.onCall(0).returns(['foo', 'bar']);
				transformDocumentToRecord.onCall(1).returns(['baz', 'qux']);
				assert.deepEqual(
					documentArrayType.set([], [{ transformDocumentToRecord }, { transformDocumentToRecord }]),
					[['foo', 'baz'], ['bar', 'qux']],
				);
			});

			it('should not mutate the original record contents if the subdocuments do not return values', () => {
				const transformDocumentToRecord = stub();
				transformDocumentToRecord.onCall(0).returns([undefined, 'foo', 'bar']);
				transformDocumentToRecord.onCall(1).returns([undefined, 'baz', 'qux']);
				assert.deepEqual(
					documentArrayType.set([], [{ transformDocumentToRecord }, { transformDocumentToRecord }]),
					[undefined, ['foo', 'baz'], ['bar', 'qux']],
				);
			});
		});

		describe('validate', () => {
			let document;
			before(() => {
				document = { validate: stub() };
			});

			beforeEach(() => {
				document.validate.reset();
			});

			it('should resolve with empty array if no errors are found in any document', async () => {
				document.validate.resolves({});
				assert.deepEqual(await documentArrayType.validate([document, document]), []);
			});

			it("should resolve with an array of the first document's errors", async () => {
				document.validate.onCall(0).resolves({ foo: 'bar', baz: 'qux' });
				document.validate.onCall(1).resolves({});
				assert.deepEqual(await documentArrayType.validate([document, document]), [
					{ foo: 'bar', baz: 'qux' },
				]);
			});

			it("should resolve with an array of the second document's errors", async () => {
				document.validate.onCall(0).resolves({});
				document.validate.onCall(1).resolves({ quux: 'corge', uier: 'grault' });
				assert.deepEqual(await documentArrayType.validate([document, document]), [
					{ quux: 'corge', uier: 'grault' },
				]);
			});

			it("should resolve with an array of each document's errors", async () => {
				document.validate.onCall(0).resolves({ foo: 'bar', baz: 'qux' });
				document.validate.onCall(1).resolves({ quux: 'corge', uier: 'grault' });
				assert.deepEqual(await documentArrayType.validate([document, document]), [
					{ foo: 'bar', baz: 'qux' },
					{ quux: 'corge', uier: 'grault' },
				]);
			});
		});

		describe('_makeSubDocument', () => {
			it('should return a new document instance from the first subrecord when yielding', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.deepEqual(value._record, ['foo', 'baz']);
				assert.strictEqual(value._isSubdocument, true);
			});

			it('should return a new subdocument instance from the second subrecord when yielding a second time', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.deepEqual(value._record, ['bar', 'qux']);
				assert.strictEqual(value._isSubdocument, true);
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
