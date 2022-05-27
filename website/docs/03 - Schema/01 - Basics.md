---
id: schema_basics
title: Schema Basics
---

# Schema Basics

The `Schema` class allows you to define your data definition for your MultiValue files. This definition is used to transform MultiValue data between the database and a JavaScript object. Additionally, it allows you to define data validation requirements to aid in ensuring data validity upon writing to the database.

## Creating a schema

The `Schema` class is exported from MVOM as a named export. To create a schema object, you should use the `new` operator.

### Syntax

```ts
constructor(definition: SchemaDefinition, options?: SchemaConstructorOptions): Schema
```

### Parameters

| Parameter  | Type     | Description                                         |
| ---------- | -------- | --------------------------------------------------- |
| definition | `object` | The [definition](#schema-definition) for the schema |
| options    | `object` | [Options object](./schema_options) (see link)       |

## Schema Definition

The schema definition is an object which describes the layout of the JavaScript object structure, how it will be accessed from a MultiValue file, and what validations will be performed when writing to a MultiValue record. You can define your own property names and give each property a mapping to a particular location in the file. Depending on what type of data is being mapped there will be different options available in the schema definition.

### Properties common to all schema definitions

| Property     | Type                 |     Mandatory      | Default | Description                                                                    |
| ------------ | -------------------- | :----------------: | ------- | ------------------------------------------------------------------------------ |
| `type`       | `string`             | :heavy_check_mark: |         | A string identifying the data type of the value represented by this definition |
| `path`       | `string` \| `number` | :heavy_check_mark: |         | The [path](#path-property) to the location of the data                         |
| `dictionary` | `string`             |                    |         | The dictionary name to use for query conditionals for this property            |
| `required`   | `boolean`            |                    | `false` | Indicate whether this property is mandatory                                    |
| `encrypted`  | `boolean`            |                    | `false` | Indicate whether this property should be encrypted                             |

### Mandatory properties

All mapped properties in a schema definition require two properties regardless of what type of data they are mapping. These properties are the `type` and `path` properties. The `type` property defines the data type of the data being mapped and the `path` property defines the location of the data in the file.

#### Type property

The `type` property can be any of the supported schema types: `string`, `number`, `boolean`, `ISOCalendarDate`, `ISOTime`, or `ISOCalendarDateTime`.

#### Path property

The `path` property can be either a `string` or a `number` and it defines the location of the data in the MultiValue file. Data can be located at a specified attribute, attribute + value, or attribute + value + subvalue location.

##### Attribute based paths

For data located in an attribute, the `path` can either be a integer `number` or a integer number like `string`. This value represents the 1-indexed position of the data in the file. For instance, if the data is located in the third attribute of a file, the `path` can either be `3` or `"3"`.

##### Value based paths

For data located in a specific value of an attribute, the `path` will be a dot-delimited `string` of integers with two parts. That is, the format of the string will be `"n.n"` where `n` represents an integer. For instance, if the data is located in the second value of the third attribute of a file, the `path` would be defined as `"3.2"`.

##### Subvalue based paths

For data located in a specific subvalue of a value of an attribute, the `path` will be a dot-delimited `string` of integers with three parts. That is, the format of the string will be `"n.n.n"` where `n` represents an integer value. For instance, If the data is locatated in the first subvalue of the second value of the third attribute of a file, the `path` would be defined as `"3.2.1"`.

:::caution
It's very likely that if you have data defined using subvalue based paths that there is either a better way to describe that data in MVOM or you might be employing a schema anti-pattern. Although this mechanism is supported by MVOM, it may be best to evaluate if there is another way to describe your schema or consider refactoring your physical database structures
:::

### Optional Properties

#### Dictionary property

The `dictionary` property indicates the MultiValue dictionary that is associated with the data indicated in the definition. It is used for the purposes of query execution. The `dictionary` property is necessary if you wish to use the property for conditionals in a query, but is otherwise optional.

#### Required property

The `required` property indicates that a value must be present when saving. If the value is `null`, `undefined`, or empty string (string types only) then an error will be thrown when saving.

#### Encrypted

The `encrypted` property indicates that a value should be encrypted on save and decrypted on access. See the [encryption](./schema_encryption) topic for more information.

### Example

The below is a relatively trivial example of mapping a simple file structure in MVOM. Suppose you had a file shaped like:

| Attribute Number | Data type | Description                                     |
| ---------------- | --------- | ----------------------------------------------- |
| 1                | `string`  | Customer ID                                     |
| 2                | `integer` | Open receivables balance                        |
| 3                | `date`    | Last activity date (internal MultiValue format) |

A schema definition for this structure might look like:

```ts
const schemaDefinition = {
  customerId: { type: 'string', path: 1 },
  openBalance: { type: 'number', path: 2 },
  lastActivityDate: { type: 'ISOCalendarDate', path: 3 },
};

const schema = new Schema(schemaDefinition);
```

More detailed examples will follow later in the discussion of the various schema types.
