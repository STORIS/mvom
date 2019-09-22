/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import DocumentArrayType, { __RewireAPI__ as RewireAPI } from './DocumentArrayType';

describe('DocumentArrayType', () => {
	const Schema = class {
		getMvPaths = stub().returns([[0], [1], [2, 0]]);
	};
	beforeAll(() => {
		RewireAPI.__Rewire__('Schema', Schema);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('Schema');
	});

	describe('constructor', () => {
		test('should set _valueSchemaType instance member', () => {
			const documentArrayType = new DocumentArrayType(new Schema());
			expect(documentArrayType._valueSchema).toBeInstanceOf(Schema);
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

		beforeAll(() => {
			RewireAPI.__Rewire__('Document', Document);
			documentArrayType = new DocumentArrayType(new Schema());
		});

		afterAll(() => {
			RewireAPI.__ResetDependency__('Document');
		});

		beforeEach(() => {
			transformRecordToDocument.resetHistory();
		});

		describe('cast', () => {
			test('should return empty array if value is not defined', () => {
				const subdocArray = documentArrayType.cast();
				expect(Array.isArray(subdocArray)).toBe(true);
				expect(subdocArray).toEqual([]);
			});

			test('should throw TypeError if non-null/object passed', () => {
				expect(() => {
					documentArrayType.cast('foo');
				}).toThrow();
			});

			describe('cast passed value to array', () => {
				const value = { foo: 'bar' };

				test('should return an array of length 1', () => {
					const subdocArray = documentArrayType.cast(value);
					expect(Array.isArray(subdocArray)).toBe(true);
					expect(subdocArray.length).toBe(1);
				});

				test('should pass the data type to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					expect(subdoc.data).toEqual(value);
				});

				test('should pass the supplied value to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					expect(subdoc._schema).toBe(documentArrayType._valueSchema);
				});

				test('should construct the document with the subdocument flag', () => {
					const [subdoc] = documentArrayType.cast(value);
					expect(subdoc.isSubdocument).toBe(true);
				});
			});

			describe('value passed as array', () => {
				const value = [{ foo: 'bar' }, { baz: 'qux' }];

				test('should return an array of same length as passed array', () => {
					const subdocArray = documentArrayType.cast(value);
					expect(Array.isArray(subdocArray)).toBe(true);
					expect(subdocArray.length).toBe(value.length);
				});

				test('should pass the data type to the document constructor', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					expect(subdoc1.data).toEqual(value[0]);
					expect(subdoc2.data).toEqual(value[1]);
				});

				test('should pass the supplied value to the document constructor', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					expect(subdoc1._schema).toBe(documentArrayType._valueSchema);
					expect(subdoc2._schema).toBe(documentArrayType._valueSchema);
				});

				test('should construct the document with the subdocument flag', () => {
					const [subdoc1, subdoc2] = documentArrayType.cast(value);
					expect(subdoc1.isSubdocument).toBe(true);
					expect(subdoc2.isSubdocument).toBe(true);
				});
			});

			describe('null value in array', () => {
				const value = [null];

				test('should return an array of length 1', () => {
					const subdocArray = documentArrayType.cast(value);
					expect(Array.isArray(subdocArray)).toBe(true);
					expect(subdocArray.length).toBe(1);
				});

				test('should pass an empty object to the document constructor', () => {
					const [subdoc] = documentArrayType.cast(value);
					expect(subdoc.data).toEqual({});
				});
			});
		});

		describe('get', () => {
			beforeAll(() => {
				stub(documentArrayType, '_makeSubDocument').returns(['foo', 'bar']);
			});

			afterAll(() => {
				documentArrayType._makeSubDocument.restore();
			});

			test('should return result of makeSubDocument generator', () => {
				expect(documentArrayType.get()).toEqual(['foo', 'bar']);
			});
		});

		describe('set', () => {
			test('should return an array of arrays based on what is returned from transformDocumentToRecord', () => {
				const transformDocumentToRecord = stub().returns(['foo', 'bar']);
				expect(documentArrayType.set([], [{ transformDocumentToRecord }])).toEqual([
					['foo'],
					['bar'],
				]);
			});

			test('should return an array of arrays with multiple items if multiple subdocuments are passed', () => {
				const transformDocumentToRecord = stub();
				transformDocumentToRecord.onCall(0).returns(['foo', 'bar']);
				transformDocumentToRecord.onCall(1).returns(['baz', 'qux']);
				expect(
					documentArrayType.set([], [{ transformDocumentToRecord }, { transformDocumentToRecord }]),
				).toEqual([['foo', 'baz'], ['bar', 'qux']]);
			});

			test('should not mutate the original record contents if the subdocuments do not return values', () => {
				const transformDocumentToRecord = stub();
				transformDocumentToRecord.onCall(0).returns([undefined, 'foo', 'bar']);
				transformDocumentToRecord.onCall(1).returns([undefined, 'baz', 'qux']);
				expect(
					documentArrayType.set([], [{ transformDocumentToRecord }, { transformDocumentToRecord }]),
				).toEqual([undefined, ['foo', 'baz'], ['bar', 'qux']]);
			});
		});

		describe('validate', () => {
			let document;
			beforeAll(() => {
				document = { validate: stub() };
			});

			beforeEach(() => {
				document.validate.reset();
			});

			test('should resolve with empty array if no errors are found in any document', async () => {
				document.validate.resolves({});
				expect(await documentArrayType.validate([document, document])).toEqual([]);
			});

			test("should resolve with an array of the first document's errors", async () => {
				document.validate.onCall(0).resolves({ foo: 'bar', baz: 'qux' });
				document.validate.onCall(1).resolves({});
				expect(await documentArrayType.validate([document, document])).toEqual([
					{ foo: 'bar', baz: 'qux' },
				]);
			});

			test("should resolve with an array of the second document's errors", async () => {
				document.validate.onCall(0).resolves({});
				document.validate.onCall(1).resolves({ quux: 'corge', uier: 'grault' });
				expect(await documentArrayType.validate([document, document])).toEqual([
					{ quux: 'corge', uier: 'grault' },
				]);
			});

			test("should resolve with an array of each document's errors", async () => {
				document.validate.onCall(0).resolves({ foo: 'bar', baz: 'qux' });
				document.validate.onCall(1).resolves({ quux: 'corge', uier: 'grault' });
				expect(await documentArrayType.validate([document, document])).toEqual([
					{ foo: 'bar', baz: 'qux' },
					{ quux: 'corge', uier: 'grault' },
				]);
			});
		});

		describe('_makeSubDocument', () => {
			test('should return a new document instance from the first subrecord when yielding', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				const { value, done } = it.next();
				expect(done).toBe(false);
				expect(value).toBeInstanceOf(Document);
				expect(transformRecordToDocument.calledOnce).toBe(true);
				expect(transformRecordToDocument.calledWith(['foo', 'baz'])).toBe(true);
				expect(value.isSubdocument).toBe(true);
			});

			test('should return a new subdocument instance from the second subrecord when yielding a second time', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				const { value, done } = it.next();
				expect(done).toBe(false);
				expect(value).toBeInstanceOf(Document);
				expect(transformRecordToDocument.calledTwice).toBe(true);
				expect(transformRecordToDocument.calledWith(['bar', 'qux'])).toBe(true);
				expect(value.isSubdocument).toBe(true);
			});

			test('should traverse the subvalued array', () => {
				const it = documentArrayType._makeSubDocument([
					['foo', 'bar'],
					['baz', 'qux'],
					[['quux', 'corge']],
				]);
				const { value, done } = it.next();
				expect(done).toBe(false);
				expect(value).toBeInstanceOf(Document);
				expect(transformRecordToDocument.calledOnce).toBe(true);
				expect(transformRecordToDocument.calledWith(['foo', 'baz', ['quux']])).toBe(true);
				expect(value.isSubdocument).toBe(true);
			});

			test('should return as done when no subrecord is possible at iteration position', () => {
				const it = documentArrayType._makeSubDocument([['foo', 'bar'], ['baz', 'qux']]);
				it.next();
				it.next();
				const { done } = it.next();
				expect(done).toBe(true);
			});
		});
	});
});
