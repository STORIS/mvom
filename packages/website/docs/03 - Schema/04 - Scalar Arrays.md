---
id: schema_scalar_arrays
title: Scalar Arrays
---

# Scalar Arrays

MVOM allows schema definitions that define arrays of any scalar schema types. In the MultiValue database, these would typically be stored as a multivalued or multi-subvalued attribute.

## Arrays from Multivalued Attributes

To create a schema definition for a multivalued attribute, you simply wrap the schema type definition in `[]` to denote it as an array.

### Formatting

A scalar array type will honor all the transformation and validation rules of the schema type that defines the array's contents. For instance, a schema type definition for an array of strings would format as follows (`{vm}` denotes value mark delimiter):

| Database Value      | JavaScript Value        |
| ------------------- | ----------------------- |
| `foo{vm}bar{vm}baz` | `["foo", "bar", "baz"]` |

### Example

```ts
const schemaDefinition = {
  stringArrayProperty: [
    {
      type: 'string',
      path: 1,
      dictionary: 'STRING_ARRAY_DICT',
      required: true,
    },
  ],
};

const schema = new Schema(schemaDefinition);
```

## Arrays from Multi-Subvalued Attributes

To create a schema definition for a multi-subvalued attribute, you simply wrap the schema type definition in `[[]]` to denote it as a multi dimensional array.

### Formatting

A scalar multi-dimensional array type will honor all the transformation and validation rules of the schema type that defines the array's contents. For instance, a schema type definition for a multi-dimensional array of strings would format as follows (`{vm}` denotes value mark delimiter and `{svm}` denotes subvalue mark delimiter):

| Database Value               | JavaScript Value                  |
| ---------------------------- | --------------------------------- |
| `foo{svm}bar{vm}baz{svm}qux` | `[["foo", "bar"], ["baz", "qux]]` |

### Example

```ts
const schemaDefinition = {
  stringMultiDimensionalArrayProperty: [
    [
      {
        type: 'string',
        path: 1,
        dictionary: 'STRING_MD_ARRAY_DICT',
        required: true,
      },
    ],
  ],
};

const schema = new Schema(schemaDefinition);
```

## Arrays from Multi-Subvalued Values

Occasionally, attributes will contain values that each denote a different data type or property. In these scenarios, its also possible that one of the values will contain a subvalue delimited list of items. MVOM will handle this as well.

### Formatting

`{vm}` denotes value mark delimiter and `{svm}` denotes subvalue mark delimiter:

| Database Value                   | JavaScript Value |
| -------------------------------- | ---------------- |
| `foo{svm}bar{vm}some other data` | `["foo", "bar"]` |

### Example

```ts
const schemaDefinition = {
  stringArrayFromValueProperty: [
    {
      type: 'string',
      path: '1.1',
      dictionary: 'STRING_VAL_ARRAY_DICT',
      required: true,
    },
  ],
  otherDataProperty: {
    type: 'string',
    path: '1.2',
    dictionary: 'OTHER_DATA_DICT',
    required: true,
  },
};

const schema = new Schema(schemaDefinition);
```
