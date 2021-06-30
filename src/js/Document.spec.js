/* eslint-disable no-underscore-dangle */
import { stub } from 'sinon';
/* eslint-disable-next-line import/named */
import Document, { __RewireAPI__ as RewireAPI } from './Document';
import Schema from './Schema';

describe('Document', () => {
	class InvalidParameterError extends Error {}
	class TransformDataError extends Error {}
	beforeAll(() => {
		RewireAPI.__Rewire__('InvalidParameterError', InvalidParameterError);
		RewireAPI.__Rewire__('TransformDataError', TransformDataError);
	});

	afterAll(() => {
		RewireAPI.__ResetDependency__('InvalidParameterError');
		RewireAPI.__ResetDependency__('TransformDataError');
	});

	describe('constructor', () => {
		const SchemaRewire = class {
			paths = {};
		};
		beforeAll(() => {
			RewireAPI.__Rewire__('Schema', SchemaRewire);
		});

		afterAll(() => {
			RewireAPI.__ResetDependency__('Schema');
		});

		test('should throw InvalidParameterError if passed data is not an object', () => {
			expect(() => new Document(new SchemaRewire(), { data: 'foo' })).toThrow();
		});

		test('should set the expected instance properties', () => {
			const document = new Document(new SchemaRewire());
			expect(document._schema).toBeInstanceOf(SchemaRewire);
		});

		test('should have an empty array as the default value for _record', () => {
			const document = new Document(new SchemaRewire());
			expect(document._schema).toBeInstanceOf(SchemaRewire);
			expect(document._record).toEqual([]);
		});

		test('should set the _record property to the record property passed into the constructor', () => {
			const schema = new Schema({
				propertyA: [
					new Schema({
						property1: { path: '1', type: Schema.Types.ISOCalendarDate },
						property2: { path: '2', type: String },
						property3: { path: '3', type: Number },
					}),
				],
			});
			const record = ['19086', 'foo', '5', ['bar', null, 'baz'], null, [['qux', 'quz']]];
			const document = new Document(schema, { record });
			expect(document._record).toEqual(record);
			expect(document).toHaveProperty('propertyA');
			expect(Array.isArray(document.propertyA)).toBe(true);
			expect(document.propertyA[0]).toMatchObject({
				property1: '2020-04-02',
				property2: 'foo',
				property3: 5,
			});
		});

		test('should have the correct property configurations', () => {
			const document = new Document(new SchemaRewire());
			const propertyDescriptors = Object.getOwnPropertyDescriptors(document);

			expect(propertyDescriptors._schema.configurable).toBe(false);
			expect(propertyDescriptors._schema.enumerable).toBe(false);
			expect(propertyDescriptors._schema.writable).toBe(false);
			expect(propertyDescriptors._record.configurable).toBe(false);
			expect(propertyDescriptors._record.enumerable).toBe(false);
			expect(propertyDescriptors._record.writable).toBe(true);
			expect(propertyDescriptors._isSubdocument.configurable).toBe(false);
			expect(propertyDescriptors._isSubdocument.enumerable).toBe(false);
			expect(propertyDescriptors._isSubdocument.writable).toBe(false);
			expect(propertyDescriptors.transformationErrors.configurable).toBe(false);
			expect(propertyDescriptors.transformationErrors.enumerable).toBe(false);
			expect(propertyDescriptors.transformationErrors.writable).toBe(false);
			expect(propertyDescriptors.transformDocumentToRecord.configurable).toBe(false);
			expect(propertyDescriptors.transformDocumentToRecord.enumerable).toBe(false);
			expect(propertyDescriptors.transformDocumentToRecord.writable).toBe(false);
			expect(propertyDescriptors._transformRecordToDocument.configurable).toBe(false);
			expect(propertyDescriptors._transformRecordToDocument.enumerable).toBe(false);
			expect(propertyDescriptors._transformRecordToDocument.writable).toBe(false);
			expect(propertyDescriptors.validate.configurable).toBe(false);
			expect(propertyDescriptors.validate.enumerable).toBe(false);
			expect(propertyDescriptors.validate.writable).toBe(false);
		});
	});

	describe('instance methods', () => {
		describe('transformDocumentToRecord', () => {
			const get = stub();
			const set = stub();
			const SchemaRewire = class {
				paths = {
					foo: {
						get,
						set,
					},
					bar: {
						get,
						set,
					},
				};
			};
			let document;

			beforeAll(() => {
				RewireAPI.__Rewire__('assignIn', stub());
				RewireAPI.__Rewire__('Schema', SchemaRewire);
				document = new Document(new SchemaRewire());
			});

			beforeEach(() => {
				delete document.foo;
				delete document.bar;
				set.reset();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('assignIn');
				RewireAPI.__ResetDependency__('Schema');
			});

			test('should call the schemaType setter for each property in the document referenced in the schema', () => {
				document.foo = 'foo';
				document.bar = 'bar';
				document.transformDocumentToRecord();
				expect(set.args[0][1]).toBe('foo');
				expect(set.args[1][1]).toBe('bar');
			});

			test('should return an array of the results from calling the schemaType setters', () => {
				set.onCall(0).returns(['foo']);
				set.onCall(1).returns(['foo', 'bar']);
				expect(document.transformDocumentToRecord()).toEqual(['foo', 'bar']);
			});

			test('should call the first setter with the original record when not a subdocument', () => {
				document._record = ['foo', 'bar'];
				document.transformDocumentToRecord();
				expect(set.args[0][0]).toEqual(['foo', 'bar']);
			});

			test('should call the first setter with an empty array when a subdocument', () => {
				const subdocument = new Document(new SchemaRewire(), { isSubdocument: true });
				subdocument._record = ['foo', 'bar'];
				subdocument.transformDocumentToRecord();
				expect(set.args[0][0]).toEqual([]);
			});
		});

		describe('validate', () => {
			const cast = stub();
			const get = stub();
			const validate = stub();
			const SchemaRewire = class {
				paths = {
					foo: {
						cast,
						get,
						validate,
					},
					bar: {
						cast,
						get,
						validate,
					},
				};
			};
			let document;

			beforeAll(() => {
				RewireAPI.__Rewire__('Schema', SchemaRewire);
				document = new Document(new SchemaRewire());
			});

			beforeEach(() => {
				delete document.foo;
				delete document.bar;
				cast.resetHistory();
				validate.reset();
			});

			afterAll(() => {
				RewireAPI.__ResetDependency__('Schema');
			});

			describe('successful cast', () => {
				beforeAll(() => {
					cast.returnsArg(0);
				});

				afterAll(() => {
					cast.reset();
				});

				test('should call the schemaType cast method for each property in the document referenced in the schema', async () => {
					validate.returns([]);
					document.foo = 'foo';
					document.bar = 'bar';
					await document.validate();
					expect(cast.args[0][0]).toBe('foo');
					expect(cast.args[1][0]).toBe('bar');
				});

				test('should call the schemaType validate method for each property in the document referenced in the schema', async () => {
					validate.returns([]);
					document.foo = 'foo';
					document.bar = 'bar';
					await document.validate();
					expect(validate.args[0][0]).toBe('foo');
					expect(validate.args[1][0]).toBe('bar');
				});

				test('should return all errors returned by the schemaType validator', async () => {
					validate.onCall(0).returns(['def', 'henk']);
					validate.onCall(1).returns(['mos', 'thud']);
					document.foo = 'foo';
					document.bar = 'bar';
					const documentErrors = await document.validate();
					expect(documentErrors).toEqual({ foo: ['def', 'henk'], bar: ['mos', 'thud'] });
				});

				test('should return empty object if schema is set to null', async () => {
					const newDocument = new Document(null);
					const documentErrors = await newDocument.validate();
					expect(documentErrors).toEqual({});
				});

				describe('idMatch', () => {
					const SchemaWithIdMatch = class {
						paths = {
							foo: {
								cast,
								get,
								validate,
							},
							bar: {
								cast,
								get,
								validate,
							},
						};

						idMatch = /\w+\*+\w/;
					};
					let newDocument;

					beforeAll(() => {
						RewireAPI.__Rewire__('Schema', SchemaWithIdMatch);
						newDocument = new Document(new SchemaWithIdMatch());
					});

					test('should not return any errors if the id matches the idMatch regular expression', async () => {
						validate.returns([]);
						newDocument._id = 'foo*bar';
						newDocument.foo = 'foo';
						newDocument.bar = 'bar';
						const documentErrors = await newDocument.validate();
						expect(documentErrors).toEqual({});
					});

					test('should return an error if the id does not match the idMatch regular expression', async () => {
						validate.returns([]);
						newDocument._id = 'foo*';
						newDocument.foo = 'foo';
						newDocument.bar = 'bar';
						const documentErrors = await newDocument.validate();
						expect(documentErrors).toEqual({ _id: 'Document id does not match pattern' });
					});
				});
			});

			describe('failed cast', () => {
				beforeAll(() => {
					cast.throws('errorName', 'errorMessage');
				});

				afterAll(() => {
					cast.reset();
				});

				test('should return the error message as throw by the failed cast', async () => {
					document.foo = 'foo';
					document.bar = 'bar';
					const documentErrors = await document.validate();
					expect(documentErrors).toEqual({ foo: 'errorMessage', bar: 'errorMessage' });
				});
			});
		});

		describe('transformRecordToDocument', () => {
			describe('stubbed tests', () => {
				const get = stub();
				const setIn = stub();
				const SchemaRewire = class {
					paths = {
						foo: {
							get,
						},
						bar: {
							get,
						},
					};
				};
				let document;

				beforeAll(() => {
					RewireAPI.__Rewire__('assignIn', stub());
					RewireAPI.__Rewire__('setIn', setIn);
					RewireAPI.__Rewire__('Schema', SchemaRewire);
					document = new Document(new SchemaRewire());
				});

				beforeEach(() => {
					document._record.length = 0; // reset to empty array
					document.transformationErrors.length = 0; // reset to empty array
					get.reset();
					setIn.resetHistory();
				});

				afterAll(() => {
					RewireAPI.__ResetDependency__('assignIn');
					RewireAPI.__ResetDependency__('setIn');
					RewireAPI.__ResetDependency__('Schema');
				});

				test('should throw InvalidParameterError is record is not passed', () => {
					expect(() => {
						document._transformRecordToDocument();
					}).toThrow();
				});

				test('should throw InvalidParameterError is record is not an array', () => {
					expect(() => {
						document._transformRecordToDocument('foo');
					}).toThrow();
				});

				test('should get from the schemaType instance using the passed record property', () => {
					const record = ['foo', 'bar', 'baz'];
					document._transformRecordToDocument(record);
					expect(get.calledWith(record)).toBe(true);
					expect(get.calledTwice).toBe(true);
				});

				test("should set at the schema's keypath with the value from get", () => {
					get.returns('baz');
					document._transformRecordToDocument([]);
					expect(setIn.calledTwice).toBe(true);
					expect(setIn.args[0][1]).toBe('foo');
					expect(setIn.args[0][2]).toBe('baz');
					expect(setIn.args[1][1]).toBe('bar');
					expect(setIn.args[1][2]).toBe('baz');
				});

				test("should set null at the schema's keypath if get throws with TransformDataError", () => {
					get.throws(new TransformDataError());
					document._transformRecordToDocument([]);
					expect(setIn.calledTwice).toBe(true);
					expect(setIn.args[0][1]).toBe('foo');
					expect(setIn.args[0][2]).toBeNull();
					expect(setIn.args[1][1]).toBe('bar');
					expect(setIn.args[1][2]).toBeNull();
				});

				test('should push two instances of TransformDataError on to transformationErrors instance property if get throws with TransformDataError', () => {
					get.throws(new TransformDataError());
					document._transformRecordToDocument([]);
					expect(document.transformationErrors.length).toBe(2);
					expect(document.transformationErrors[0]).toBeInstanceOf(TransformDataError);
					expect(document.transformationErrors[1]).toBeInstanceOf(TransformDataError);
				});

				test('should rethrow if any error other than TransformDataError is thrown', () => {
					get.throws(new Error());
					expect(() => {
						document._transformRecordToDocument([]);
					}).toThrow();
				});
			});

			describe('non-stubbed tests', () => {
				// this set of tests is very intentionally not behaving like a "true" unit test as the function's external dependencies
				//   are not being stubbed.  This is because of a strong desire to test the input mv-type data structures to the
				//   anticipated outputs arising from applying the schema.  The external dependencies are either static helper functions
				//   internal to the Model class or lodash methods.  lodash methods can be considered javascript "language extensions",
				//   so stubbing their behavior is not crucial.  The static helper functions will be tested on their own in separate blocks
				//   to ensure satisfactory coverage of their individual behavior.
				describe('arrays of Schemas', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({
							propertyA: [
								new Schema({
									property1: { path: '1', type: String },
									property2: { path: '2', type: String },
								}),
							],
						});
					});

					test('should properly format well-formatted arrays of Schemas', () => {
						const record = [
							['foo', 'bar'],
							['baz', 'qux'],
						];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(Array.isArray(document.propertyA)).toBe(true);
						expect(document.propertyA[0]).toMatchObject({ property1: 'foo', property2: 'baz' });
						expect(document.propertyA[1]).toMatchObject({ property1: 'bar', property2: 'qux' });
					});

					test('should properly format arrays of Schemas not structured as arrays in data', () => {
						const record = ['foo', 'bar'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(Array.isArray(document.propertyA)).toBe(true);
						expect(document.propertyA[0]).toMatchObject({ property1: 'foo', property2: 'bar' });
					});

					test('should properly format arrays of Schemas with ragged associations', () => {
						const record = [['foo', 'bar'], 'baz'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(Array.isArray(document.propertyA)).toBe(true);
						expect(document.propertyA[0]).toMatchObject({ property1: 'foo', property2: 'baz' });
						expect(document.propertyA[1]).toMatchObject({ property1: 'bar', property2: null });
					});

					test('should properly format arrays of Schemas with sparse associations', () => {
						const record = [
							['foo', null, 'bar'],
							['baz', null, 'qux'],
						];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(Array.isArray(document.propertyA)).toBe(true);
						expect(document.propertyA[0]).toMatchObject({ property1: 'foo', property2: 'baz' });
						expect(document.propertyA[1]).toMatchObject({ property1: null, property2: null });
						expect(document.propertyA[2]).toMatchObject({ property1: 'bar', property2: 'qux' });
					});
				});

				describe('arrays of Schemas containing arrays of Schemas', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({
							propertyA: [
								new Schema({
									property1: { path: '1', type: String },
									propertyB: [{ property2: { path: '2', type: String } }],
								}),
							],
						});
					});

					test('should properly format nested sub-schemas', () => {
						const record = [
							['foo', 'bar'],
							[
								['baz', 'qux'],
								['quux', 'corge'],
							],
						];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(Array.isArray(document.propertyA)).toBe(true);
						expect(document.propertyA[0]).toMatchObject({ property1: 'foo' });
						expect(document.propertyA[0]).toHaveProperty('propertyB');
						expect(Array.isArray(document.propertyA[0].propertyB)).toBe(true);
						expect(document.propertyA[0].propertyB[0]).toMatchObject({ property2: 'baz' });
						expect(document.propertyA[0].propertyB[1]).toMatchObject({ property2: 'qux' });

						expect(document.propertyA[1]).toMatchObject({ property1: 'bar' });
						expect(document.propertyA[1]).toHaveProperty('propertyB');
						expect(Array.isArray(document.propertyA[1].propertyB)).toBe(true);
						expect(document.propertyA[1].propertyB[0]).toMatchObject({ property2: 'quux' });
						expect(document.propertyA[1].propertyB[1]).toMatchObject({ property2: 'corge' });
					});
				});

				describe('nested arrays of data definitions', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({ propertyA: [[{ path: '1', type: String }]] });
					});

					test('should properly format well-formatted nested arrays', () => {
						const record = [
							[
								['foo', 'bar'],
								['baz', 'qux'],
							],
						];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({
							propertyA: [
								['foo', 'bar'],
								['baz', 'qux'],
							],
						});
					});

					test('should properly format nested arrays of length 1', () => {
						const record = [['foo', 'bar']];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: [['foo'], ['bar']] });
					});

					test('should properly format nested arrays that are not array-like in the data', () => {
						const record = ['foo'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: [['foo']] });
					});

					test('should properly format nested arrays that are null values', () => {
						const record = [null];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: [] });
					});

					test('should properly format nested arrays that that have null values at indices other than 0', () => {
						const record = [[null, null]];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: [[null], [null]] });
					});
				});

				describe('arrays of data definitions', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({ propertyA: [{ path: '1', type: String }] });
					});

					test('should properly format well-formatted arrays', () => {
						const record = [['foo', 'bar']];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: ['foo', 'bar'] });
					});

					test('should properly format arrays that are not array-like in the data', () => {
						const record = ['foo'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: ['foo'] });
					});

					test('should properly format arrays that are null values', () => {
						const record = [null];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: [] });
					});

					test('should properly format arrays that have null values at indices other than 0', () => {
						const record = [['foo', null]];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: ['foo', null] });
					});
				});

				describe('property value is schema', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({
							propertyA: new Schema({ property1: { path: '1', type: String } }),
						});
					});

					test('should properly format a property whose value is another schema', () => {
						const record = ['foo'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toHaveProperty('propertyA');
						expect(document.propertyA).toMatchObject({ property1: 'foo' });
					});
				});

				describe('property value is data definition', () => {
					let schema;
					beforeAll(() => {
						schema = new Schema({ propertyA: { path: '1', type: String } });
					});

					test('should properly format a property whose value is a data definition', () => {
						const record = ['foo'];
						const document = new Document(schema);
						document._transformRecordToDocument(record);
						expect(document).toMatchObject({ propertyA: 'foo' });
					});
				});
			});

			describe('null schema', () => {
				const schema = null;

				test('should create a document with all data as a single array under a "_raw" property if schema is null', () => {
					const record = ['foo', 'bar', 'baz'];
					const document = new Document(schema);
					document._transformRecordToDocument(record);
					expect(document).toMatchObject({ _raw: ['foo', 'bar', 'baz'] });
				});

				test('should transform a document to a record of a single array if the schema is set to null', () => {
					const document = new Document(schema, { data: { _raw: ['foo', 'bar', 'baz'] } });
					const record = document.transformDocumentToRecord();
					expect(record).toEqual(['foo', 'bar', 'baz']);
				});
			});
		});
	});
});
