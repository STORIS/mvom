/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import { stub } from 'sinon';
import Schema from 'Schema';
import Document, { __RewireAPI__ as RewireAPI } from './';

describe('Document', () => {
	describe('constructor', () => {
		const SchemaRewire = class {
			paths = {};
		};
		before(() => {
			RewireAPI.__Rewire__('Schema', SchemaRewire);
		});

		after(() => {
			RewireAPI.__ResetDependency__('Schema');
		});

		it('should throw if Schema instance is not provided', () => {
			assert.throws(() => new Document('foo', ['bar']));
		});

		it('should throw if a record array is not provided', () => {
			assert.throws(() => new Document(new SchemaRewire(), 'foo'));
		});

		it('should set the expected instance properties', () => {
			const document = new Document(new SchemaRewire(), ['foo']);
			assert.instanceOf(document._schema, SchemaRewire);
			assert.deepEqual(document._record, ['foo']);
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

			before(() => {
				RewireAPI.__Rewire__('assignIn', stub());
				RewireAPI.__Rewire__('Schema', SchemaRewire);
				document = new Document(new SchemaRewire(), ['foo']);
			});

			beforeEach(() => {
				delete document.foo;
				delete document.bar;
				set.reset();
			});

			after(() => {
				RewireAPI.__ResetDependency__('assignIn');
				RewireAPI.__ResetDependency__('Schema');
			});

			it('should call the schemaType setter for each property in the document referenced in the schema', () => {
				document.foo = 'foo';
				document.bar = 'bar';
				document.transformDocumentToRecord();
				assert.strictEqual(set.args[0][1], 'foo');
				assert.strictEqual(set.args[1][1], 'bar');
			});

			it('should return an array of the results from calling the schemaType setters', () => {
				set.onCall(0).returns(['foo']);
				set.onCall(1).returns(['foo', 'bar']);
				assert.deepEqual(document.transformDocumentToRecord(), ['foo', 'bar']);
			});

			it('should call the first setter with the original record when not a subdocument', () => {
				document._record = ['foo', 'bar'];
				document.transformDocumentToRecord();
				assert.deepEqual(set.args[0][0], ['foo', 'bar']);
			});

			it('should call the first setter with an empty array when a subdocument', () => {
				const subdocument = new Document(new SchemaRewire(), ['foo'], { isSubdocument: true });
				subdocument._record = ['foo', 'bar'];
				subdocument.transformDocumentToRecord();
				assert.deepEqual(set.args[0][0], []);
			});
		});

		describe('_transformRecordToDocument', () => {
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

				before(() => {
					RewireAPI.__Rewire__('assignIn', stub());
					RewireAPI.__Rewire__('setIn', setIn);
					RewireAPI.__Rewire__('Schema', SchemaRewire);
					document = new Document(new SchemaRewire(), ['foo']);
				});

				beforeEach(() => {
					document._record = [];
					get.reset();
					setIn.resetHistory();
				});

				after(() => {
					RewireAPI.__ResetDependency__('assignIn');
					RewireAPI.__ResetDependency__('setIn');
					RewireAPI.__ResetDependency__('Schema');
				});

				it("should get from the schemaType instance using the document's record property", () => {
					document._record = ['foo', 'bar', 'baz'];
					document._transformRecordToDocument();
					assert.isTrue(get.calledWith(document._record));
					assert.isTrue(get.calledTwice);
				});

				it("should set at the schema's keypath with the value from get", () => {
					get.returns('baz');
					document._transformRecordToDocument();
					assert.isTrue(setIn.calledTwice);
					assert.strictEqual(setIn.args[0][1], 'foo');
					assert.strictEqual(setIn.args[0][2], 'baz');
					assert.strictEqual(setIn.args[1][1], 'bar');
					assert.strictEqual(setIn.args[1][2], 'baz');
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
					before(() => {
						schema = new Schema({
							propertyA: [
								new Schema({
									property1: { path: '1', type: String },
									property2: { path: '2', type: String },
								}),
							],
						});
					});

					it('should properly format well-formatted arrays of Schemas', () => {
						const record = [['foo', 'bar'], ['baz', 'qux']];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [
								{ property1: 'foo', property2: 'baz' },
								{ property1: 'bar', property2: 'qux' },
							],
						});
					});

					it('should properly format arrays of Schemas not structured as arrays in data', () => {
						const record = ['foo', 'bar'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [{ property1: 'foo', property2: 'bar' }],
						});
					});

					it('should properly format arrays of Schemas with ragged associations', () => {
						const record = [['foo', 'bar'], 'baz'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [
								{ property1: 'foo', property2: 'baz' },
								{ property1: 'bar', property2: '' },
							],
						});
					});

					it('should properly format arrays of Schemas with sparse associations', () => {
						const record = [['foo', null, 'bar'], ['baz', null, 'qux']];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [
								{ property1: 'foo', property2: 'baz' },
								{ property1: '', property2: '' },
								{ property1: 'bar', property2: 'qux' },
							],
						});
					});
				});

				describe('arrays of Schemas containing arrays of Schemas', () => {
					let schema;
					before(() => {
						schema = new Schema({
							propertyA: [
								new Schema({
									property1: { path: '1', type: String },
									propertyB: [{ property2: { path: '2', type: String } }],
								}),
							],
						});
					});

					it('should properly format nested sub-schemas', () => {
						const record = [['foo', 'bar'], [['baz', 'qux'], ['quux', 'corge']]];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [
								{ property1: 'foo', propertyB: [{ property2: 'baz' }, { property2: 'qux' }] },
								{ property1: 'bar', propertyB: [{ property2: 'quux' }, { property2: 'corge' }] },
							],
						});
					});
				});

				describe('nested arrays of data definitions', () => {
					let schema;
					before(() => {
						schema = new Schema({ propertyA: [[{ path: '1', type: String }]] });
					});

					it('should properly format well-formatted nested arrays', () => {
						const record = [[['foo', 'bar'], ['baz', 'qux']]];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [['foo', 'bar'], ['baz', 'qux']],
						});
					});

					it('should properly format nested arrays of length 1', () => {
						const record = [['foo', 'bar']];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [['foo'], ['bar']],
						});
					});

					it('should properly format nested arrays that are not array-like in the data', () => {
						const record = ['foo'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [['foo']],
						});
					});

					it('should properly format nested arrays that are null values', () => {
						const record = [null];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [['']],
						});
					});
				});

				describe('arrays of data definitions', () => {
					let schema;
					before(() => {
						schema = new Schema({ propertyA: [{ path: '1', type: String }] });
					});

					it('should properly format well-formatted arrays', () => {
						const record = [['foo', 'bar']];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: ['foo', 'bar'],
						});
					});

					it('should properly format arrays that are not array-like in the data', () => {
						const record = ['foo'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: ['foo'],
						});
					});

					it('should properly format arrays that are null values', () => {
						const record = [null];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: [''],
						});
					});
				});

				describe('property value is schema', () => {
					let schema;
					before(() => {
						schema = new Schema({
							propertyA: new Schema({ property1: { path: '1', type: String } }),
						});
					});

					it('should properly format a property whose value is another schema', () => {
						const record = ['foo'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: { property1: 'foo' },
						});
					});
				});

				describe('property value is data definition', () => {
					let schema;
					before(() => {
						schema = new Schema({ propertyA: { path: '1', type: String } });
					});

					it('should properly format a property whose value is a data definition', () => {
						const record = ['foo'];
						const document = new Document(schema, record);
						assert.deepEqual(document._transformRecordToDocument(), {
							propertyA: 'foo',
						});
					});
				});
			});
		});
	});
});
