/* eslint-disable no-underscore-dangle */
import { assert } from 'chai';
import Schema from 'Schema';
import Document from './';

describe('Document', () => {
	describe('static methods', () => {
		describe('applySchemaToRecord', () => {
			// this set of tests is very intentionally not behaving like a "true" unit test as the function's external dependencies
			//   are not being stubbed.  This is because of a strong desire to test the input mv-type data structures to the
			//   anticipated outputs arising from applying the schema.  The external dependencies are either static helper functions
			//   internal to the Model class or lodash methods.  lodash methods can be considered javascript "language extensions",
			//   so stubbing their behavior is not crucial.  The static helper functions will be tested on their own in separate blocks
			//   to ensure satisfactory coverage of their individual behavior.
			describe('arrays of Schemas', () => {
				const schema = new Schema({
					propertyA: [new Schema({ property1: { path: '1' }, property2: { path: '2' } })],
				});
				it('should properly format well-formatted arrays of Schemas', () => {
					const record = [['foo', 'bar'], ['baz', 'qux']];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [
							{ property1: 'foo', property2: 'baz' },
							{ property1: 'bar', property2: 'qux' },
						],
					});
				});

				it('should properly format arrays of Schemas not structured as arrays in data', () => {
					const record = ['foo', 'bar'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [{ property1: 'foo', property2: 'bar' }],
					});
				});

				it('should properly format arrays of Schemas with ragged associations', () => {
					const record = [['foo', 'bar'], 'baz'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [{ property1: 'foo', property2: 'baz' }, { property1: 'bar' }],
					});
				});

				it('should properly format arrays of Schemas with sparse associations', () => {
					const record = [['foo', null, 'bar'], ['baz', null, 'qux']];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [
							{ property1: 'foo', property2: 'baz' },
							{ property1: null, property2: null },
							{ property1: 'bar', property2: 'qux' },
						],
					});
				});
			});

			describe('arrays of Schemas containing arrays of Schemas', () => {
				const schema = new Schema({
					propertyA: [
						new Schema({ property1: { path: '1' }, propertyB: [{ property2: { path: '2' } }] }),
					],
				});

				it('should properly format nested sub-schemas', () => {
					const record = [['foo', 'bar'], [['baz', 'qux'], ['quux', 'corge']]];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [
							{ property1: 'foo', propertyB: [{ property2: 'baz' }, { property2: 'qux' }] },
							{ property1: 'bar', propertyB: [{ property2: 'quux' }, { property2: 'corge' }] },
						],
					});
				});
			});

			describe('nested arrays of data definitions', () => {
				const schema = new Schema({ propertyA: [[{ path: '1' }]] });
				it('should properly format well-formatted nested arrays', () => {
					const record = [[['foo', 'bar'], ['baz', 'qux']]];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [['foo', 'bar'], ['baz', 'qux']],
					});
				});

				it('should properly format nested arrays of length 1', () => {
					const record = [['foo', 'bar']];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [['foo'], ['bar']],
					});
				});

				it('should properly format nested arrays that are not array-like in the data', () => {
					const record = ['foo'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [['foo']],
					});
				});

				it('should properly format nested arrays that are null values', () => {
					const record = [null];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [[null]],
					});
				});
			});

			describe('arrays of data definitions', () => {
				const schema = new Schema({ propertyA: [{ path: '1' }] });
				it('should properly format well-formatted arrays', () => {
					const record = [['foo', 'bar']];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: ['foo', 'bar'],
					});
				});

				it('should properly format arrays that are not array-like in the data', () => {
					const record = ['foo'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: ['foo'],
					});
				});

				it('should properly format arrays that are null values', () => {
					const record = [null];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: [null],
					});
				});
			});

			describe('property value is schema', () => {
				const schema = new Schema({ propertyA: new Schema({ property1: { path: '1' } }) });
				it('should properly format a property whose value is another schema', () => {
					const record = ['foo'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: { property1: 'foo' },
					});
				});
			});

			describe('property value is data definition', () => {
				const schema = new Schema({ propertyA: { path: '1' } });
				it('should properly format a property whose value is a data definition', () => {
					const record = ['foo'];
					assert.deepEqual(Document.applySchemaToRecord(schema, record), {
						propertyA: 'foo',
					});
				});
			});
		});

		describe('getFromMvData', () => {
			it('should get value from shallow path', () => {
				const record = ['foo'];
				assert.strictEqual(Document.getFromMvData(record, ['0']), 'foo');
			});

			it('should get value from one-level deep path', () => {
				const record = [['foo', 'bar']];
				assert.strictEqual(Document.getFromMvData(record, ['0', '1']), 'bar');
			});

			it('should get value from one-level deep path not formatted as array', () => {
				const record = ['foo'];
				assert.strictEqual(Document.getFromMvData(record, ['0', '0']), 'foo');
			});

			it('should get value from two-level deep path', () => {
				const record = [[['foo', 'bar'], ['baz', 'qux']]];
				assert.strictEqual(Document.getFromMvData(record, ['0', '1', '1']), 'qux');
			});

			it('should get value from two-level deep path not formatted as deep array', () => {
				const record = [['foo', 'bar']];
				assert.strictEqual(Document.getFromMvData(record, ['0', '1', '0']), 'bar');
			});

			it('should get value from two-level deep path not formatted as array', () => {
				const record = ['foo'];
				assert.strictEqual(Document.getFromMvData(record, ['0', '0', '0']), 'foo');
			});
		});

		describe('objArrayToArrayObj', () => {
			it('should transform an object with property values of arrays', () => {
				assert.deepEqual(Document.objArrayToArrayObj({ propertyA: ['foo', 'bar'] }), [
					{ propertyA: 'foo' },
					{ propertyA: 'bar' },
				]);
			});

			it('should deeply transform an object with property values of arrays', () => {
				assert.deepEqual(
					Document.objArrayToArrayObj({
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

	describe('instance methods', () => {
		describe('_protectProperties', () => {
			it("should define all of the passed object's properties as not configurable/enumerable/writable", () => {
				const test = new Document();
				test.property1 = 'foo';
				test.property2 = 'bar';
				test._protectProperties();
				assert.deepInclude(Object.getOwnPropertyDescriptor(test, 'property1'), {
					configurable: false,
					enumerable: false,
					writable: false,
				});
				assert.deepInclude(Object.getOwnPropertyDescriptor(test, 'property2'), {
					configurable: false,
					enumerable: false,
					writable: false,
				});
			});
		});
	});
});
