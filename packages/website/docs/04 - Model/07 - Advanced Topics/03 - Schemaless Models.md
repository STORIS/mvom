---
id: model_schemaless
title: Schemaless Models
---

# Schemaless Models

On occasion, MultiValue records will be used in a manner that does not lend itself to defining a schema. The flexibility of the MultiValue data structure allows records to take amorphous shapes. For instance, a MultiValue record might be a dynamically sized list of strings with each attribute containing one item from the list. It is not possible to define a Schema for these types of records, but consumers of MVOM might still wish to work with records of that nature. Schemaless models allow for that functionality. To create a `Model` that does not have a schema, you should provide `null` for the schema parameter in the call to `connection.model`.

A `Model` instance that was created with a schema will have properties that match the schema. That is, the shape of the `Model` object will align with that of the schema. However, schemaless models cannot work that way since they do not have schemas. Instead, a `Model` that is created without a `Schema` will instead have a property `_raw` on it.

## The \_raw Property

The `_raw` property is fairly simple. After reading a record using a schemaless model, the `_raw` property will be populated with an array that matches the MultiValue data structure. Attributes will be converted to values of the array. If attributes contain values or the values contain subvalues, then the array will be multidimensional.

Consumers can work with the `_raw` property of the `Model` instance as they would any other array. Upon saving, the `_raw` property will be turned back into a MultiValue record by converting the array into attributes, values, and subvalues.

## Example

Suppose you had a database record structured as follows:

| Attribute | Value         |
| --------- | ------------- |
| ID        | `0001`        |
| 1         | `foo`         |
| 2         | `bar`         |
| 3         | `baz`         |
| 4         | `qux{vm}quux` |

You could create and read using a schemaless `Model` as follows:

```ts
const Schemaless = connection.model(null, 'SOME_FILE');

const schemaless = await Schemaless.findById('0001');
console.log(schemaless._raw); // outputs ['foo', 'bar', 'baz', ['qux', 'quux']]

schemaless._raw.push('last in line');
schemaless.save();
```
