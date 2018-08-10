/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import DocumentArrayType, { __RewireAPI__ as RewireAPI } from './';

describe('DocumentArrayType', () => {
	const Schema = class {
		getMvPaths = stub().returns([[0], [1], [2, 0]]);
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
		const transformRecordToDocument = stub();
		const Document = class {
			constructor(schema, data, { isSubdocument }) {
				this._schema = schema;
				this.data = data;
				this.isSubdocument = isSubdocument;
			}

			transformRecordToDocument = transformRecordToDocument;
		};
		let documentArrayType;

		before(() => {
			RewireAPI.__Rewire__('Document', Document);
			documentArrayType = new DocumentArrayType(new Schema());
		});

		after(() => {
			RewireAPI.__ResetDependency__('Document');
		});

		beforeEach(() => {
			transformRecordToDocument.resetHistory();
		});

		describe('cast', () => {
			it('should return empty array if value is not defined', () => {
				const subdocArray = documentArrayType.cast();
				assert.isArray(subdocArray);
				assert.isEmpty(subdocArray);
			});

			it('should throw TypeError if non-null/object passed', () => {
				assert.throws(() => {
					documentArrayType.cast('foo');
				});
			});

			describe('cast passed value to array', () => {
				const value = { foo: 'bar' };

				it('should return an array of length 1', () => {
					const subdocArray = documentArrayType.cast(value);
					assert.isArray(subdocArray);
					assert.strictEqual(subdocArray.length, 1);
				});

				it('should pass the data type to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					assert.deepEqual(subdoc.data, value);
				});

				it('should pass the supplied value to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					assert.strictEqual(subdoc._schema, documentArrayType._valueSchema);
				});

				it('should construct the document with the subdocument flag', () => {
					const [subdoc] = documentArrayType.cast(value);
					assert.isTrue(subdoc.isSubdocument);
				});
			});

			describe('value passed as array', () => {
				const value = [{ foo: 'bar' }, { baz: 'qux' }];

				it('should return an array of same length as passed array', () => {
					const subdocArray = documentArrayType.cast(value);
					assert.isArray(subdocArray);
					assert.strictEqual(subdocArray.length, value.length);
				});

				it('should pass the data type to the document constructor', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					assert.deepEqual(subdoc1.data, value[0]);
					assert.deepEqual(subdoc2.data, value[1]);
				});

				it('should pass the supplied value to the document constructor', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					assert.strictEqual(subdoc1._schema, documentArrayType._valueSchema);
					assert.strictEqual(subdoc2._schema, documentArrayType._valueSchema);
				});

				it('should construct the document with the subdocument flag', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					assert.isTrue(subdoc1.isSubdocument);
					assert.isTrue(subdoc2.isSubdocument);
				});
			});

			describe('null value in array', () => {
				const value = [null];

				it('should return an array of length 1', () => {
					const subdocArray = documentArrayType.cast(value);
					assert.isArray(subdocArray);
					assert.strictEqual(subdocArray.length, 1);
				});

				it('should pass an empty object to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					assert.deepEqual(subdoc.data, {});
				});
			});
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
				assert.isTrue(transformRecordToDocument.calledOnce);
				assert.isTrue(transformRecordToDocument.calledWith(['foo', 'baz']));
				assert.strictEqual(value.isSubdocument, true);
			});

			it('should return a new subdocument instance from the second subrecord when yielding a second time', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.isTrue(transformRecordToDocument.calledTwice);
				assert.isTrue(transformRecordToDocument.calledWith(['bar', 'qux']));
				assert.strictEqual(value.isSubdocument, true);
			});

			it('should traverse the subvalued array', () => {
				const it = documentArrayType._makeSubDocument([
					['foo', 'bar'],
					['baz', 'qux'],
					[['quux', 'corge']],
				]);
				const { value, done } = it.next();
				assert.isFalse(done);
				assert.instanceOf(value, Document);
				assert.isTrue(transformRecordToDocument.calledOnce);
				assert.isTrue(transformRecordToDocument.calledWith(['foo', 'baz', ['quux']]));
				assert.strictEqual(value.isSubdocument, true);
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
