---
id: model_basics
title: Model Basics
---

# Model Basics

A `Model` is a special constructor which is derived from a `Connection` and a `Schema` instance. Model constructors are dynamically generated from the connection and schema and are the interface point to the MultiValue database. All of the logic for interacting with data therefore comes from a Model class.

## Creating a Model Constructor

Each `Model` constructor is unique. That is, there is no `Model` constructor exported from MVOM. It is instead created at runtime by a consumer once a connection has been established and a schema defined.

A `Model` first requires a [schema](../Schema/schema_basics) instance as well as an [open database connection](../connection#opening-a-connection). Once those prerequisites have been met, a `Model` can be created using the `model` method of the `Connection` instance.

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

## Model instances

An instance of a Model is a representation of data as defined by a Schema. That is, the properties of a Model are those which are described by the Schema. Records read from a MultiValue database will be transformed into a Model instance using the Schema. When saving to the database, a Model instance will be transformed into MultiValue delimited record format. Essentially, a Model instance is an object with a shape matching the schema which acts as an abstraction over the MultiValue data structure.

### The \_id Property

The `_id` property is a special property that exists on all `Model` instances. The `_id` property of a model instance contains the database record ID that is associated with the `Model` instance. Once the `_id` property has been set on a `Model` instance, it will be immutable (read only) thereafter. This property is accessible to all `Model` consumers for read access purposes to determine the record ID.

#### Reading from the database

When reading data from the database, the `_id` property is automatically populated with the database record ID.

#### Writing to the database

Models can be instantiated without an `_id` property. However, the `_id` property _must_ be set prior to saving a Model or an error will be thrown. When saving, it will be the record ID used.
