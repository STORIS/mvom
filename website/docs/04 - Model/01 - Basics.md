---
id: model_basics
title: Model Basics
---

# Model Basics

A `Model` is a special constructor which is derived from a `Connection` and a `Schema` instance. Model constructors are dynamically generated from the connection and schema and are the interface point to the MultiValue database. All of the logic for interacting with data therefore comes from this Model class.

Each `Model` constructor is unique. That is, there is no `Model` constructor exported from MVOM. It is instead created at runtime by a consumer once a connection has been established and a schema defined.

## Creating a Model

A `Model` first requires a [schema](../Schema/schema_basics) instance as well as an [open database connection](../connection#opening-a-connection). Once that prerequisites have been met, a `Model` can be created using the `model` method of the `Connection` instance.

### Syntax

```ts
model(schema: Schema | null, file: string): ModelConstructor
```

### Parameters

| Parameter | Type               | Description                                                                                    |
| --------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `schema`  | `Schema` \| `null` | The instance of the `Schema` class to associate with the model or `null` for schemaless models |
| `file`    | `string`           | The name of the file in the MultiValue database                                                |

### Example

```ts
const Item = connection.createModel(itemSchema, 'ITEM');
```

:::info
By convention, a `Model` has a capitalized first letter. This is because a `Model` is a class constructor and by convention class constructors in many programming languages are capitalized. This is not enforced but strongly recommended.
:::
