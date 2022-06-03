---
id: document
title: Document
---

# Document

The `Document` class is the superclass of the `Model` class. Essentially a `Document` is a `Model` without any of the database access functionality of the `Model` class. A `Document` has a `Schema` but it does not have a `Connection`. Most consumers will never need to interact directly with a `Document`.

## createDocumentFromRecordString Method

The `Document` class exposes a static method `createDocumentFromRecordString`. This factory method allows for creation of a `Document` instance from a string of delimited data representing a MultiValue record. The returned value from this method will be a `Document` instance that has formatted that delimited string according to the schema.

If you ever have a need to construct an object from an MVOM `Schema` that did not originate from a `Model` then this method will prove useful.

### Syntax

```ts
static createDocumentFromRecordString(schema: Schema, recordString: string, dbServerDelimiters: object): Document
```

### Parameters

| Parameter            | Type     | Description                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `schema`             | `Schema` | An instance of an MVOM schema                                                                                            |
| `recordString`       | `string` | A string of data delimited with MultiValue attribute, value, and subvalue marks                                          |
| `dbServerDelimiters` | `object` | An object containing the characters which represent record, attribute, value, and subvalue marks in the delimited string |

#### dbServerDelimiters Object

| Property | Type     | Description                                   |
| -------- | -------- | --------------------------------------------- |
| `rm`     | `string` | The character representing the record mark    |
| `am`     | `string` | The character representing the attribute mark |
| `vm`     | `string` | The character representing the value mark     |
| `svm`    | `string` | The character representing the subvalue mark  |
