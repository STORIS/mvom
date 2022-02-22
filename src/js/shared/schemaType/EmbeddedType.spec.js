import { stub } from 'sinon';
import EmbeddedType, { __RewireAPI__ as RewireAPI } from './EmbeddedType';

describe('EmbeddedType', () => {
	class Schema {}
	beforeAll(() => {
		RewireAPI.__Rewire__('Schema', Schema);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('Schema');
	});

	describe('constructor', () => {
		test('should set _valueSchemaType instance member', () => {
			const embeddedType = new EmbeddedType(new Schema());
			expect(embeddedType._valueSchema).toBeInstanceOf(Schema);
		});
	});

	describe('instance methods', () => {
		const transformRecordToDocument = stub();
		class Document {
			_transformRecordToDocument = transformRecordToDocument;

			constructor(schema, { data, isSubdocument, record }) {
				this._schema = schema;
				this.data = data;
				this._record = record;
				this.isSubdocument = isSubdocument;
			}
		}
		let embeddedType;
		beforeAll(() => {
			RewireAPI.__Rewire__('Document', Document);
			embeddedType = new EmbeddedType(new Schema());
		});

		afterAll(() => {
			RewireAPI.__ResetDependency__('Document');
		});

		beforeEach(() => {
			transformRecordToDocument.resetHistory();
		});

		describe('cast', () => {
			test('should throw TypeError if non-null/object passed', () => {
				expect(() => {
					embeddedType.cast('foo');
				}).toThrow();
			});

			describe('object value', () => {
				const value = { foo: 'bar' };

				test('should return a Document instance', () => {
					expect(embeddedType.cast(value)).toBeInstanceOf(Document);
				});

				test('should pass the data type to the document constructor', () => {
					const embeddedDoc = embeddedType.cast(value);
					expect(embeddedDoc.data).toEqual(value);
				});

				test('should pass the supplied value to the document constructor', () => {
					const embeddedDoc = embeddedType.cast(value);
					expect(embeddedDoc._schema).toBe(embeddedType._valueSchema);
				});

				test('should construct the document with the subdocument flag', () => {
					const embeddedDoc = embeddedType.cast(value);
					expect(embeddedDoc.isSubdocument).toBe(true);
				});
			});

			describe('null value', () => {
				const value = null;

				test('should pass an empty object to the document constructor', () => {
					const embeddedDoc = embeddedType.cast(value);
					expect(embeddedDoc.data).toEqual({});
				});
			});
		});

		describe('get', () => {
			test('should return a newly instantiated Document using instance schema and passed record', () => {
				const getValue = embeddedType.get('foo');
				expect(getValue._schema).toBeInstanceOf(Schema);
			});
		});

		describe('set', () => {
			test('should return an array of contents based on what is returned from transformDocumentToRecord', () => {
				const transformDocumentToRecord = stub().returns(['foo', 'bar']);
				expect(embeddedType.set([], { transformDocumentToRecord })).toEqual(['foo', 'bar']);
			});

			test('should not mutate the original record contents if the subdocument does not return a value', () => {
				const transformDocumentToRecord = stub().returns([undefined, 'bar', 'baz']);
				expect(embeddedType.set(['foo'], { transformDocumentToRecord })).toEqual([
					'foo',
					'bar',
					'baz',
				]);
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

			test('should return an array of any errors returned from the document validate function', async () => {
				document.validate.resolves({ foo: 'bar' });
				expect(await embeddedType.validate(document)).toEqual([{ foo: 'bar' }]);
			});

			test('should return an empty array if the document validate function does not return any errors', async () => {
				document.validate.resolves({});
				expect(await embeddedType.validate(document)).toEqual([]);
			});
		});
	});
});
