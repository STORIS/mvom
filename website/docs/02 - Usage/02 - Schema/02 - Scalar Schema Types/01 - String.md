---
id: schema_type_string
title: String
---

# String Schema Type

The string schema type is the simplest of the schema types supported by MVOM.

## Schema Definition Properties

| Property     | Type                 |     Mandatory      | Default | Description                                                               |
| ------------ | -------------------- | :----------------: | ------- | ------------------------------------------------------------------------- |
| `type`       | `"string"`           | :heavy_check_mark: |         | The type literal for a string schema type                                 |
| `path`       | `string` \| `number` | :heavy_check_mark: |         | The [path](../schema_basics#path-property) to the location of the data    |
| `dictionary` | `string`             |                    |         | The dictionary name to use for query conditionals for this property       |
| `required`   | `boolean`            |                    | `false` | Indicate whether this property is mandatory                               |
| `encrypted`  | `boolean`            |                    | `false` | Indicate whether this property should be encrypted                        |
| `enum`       | `string[]`           |                    |         | If specified, value will be validated against this list of allowed values |
| `match`      | `RegExp`             |                    |         | If specified, value will be matched against this regular expression       |

## Formatting

A string schema type will not be formatted. The input and output values will remain the same.

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `foo`          | `foo`            |

## Validating enumerations

The `enum` property allows you to specify an array of permitted values for string types. If the value of the property is not in this list an error will be thrown when saving.

## Validating pattern matching

The `match` property allows you to specify a regular expression which will validate the value to determine if there is a match of the regular expression. If the value of the property does not match the regular expression an error will be thrown when saving.

## Example

```ts
const schemaDefinition = {
  stringProperty: {
    type: 'string',
    path: 1,
    dictionary: 'STRING_DICT',
    required: true,
    enum: ['foo', 'bar', 'baz'],
  },
};
```
