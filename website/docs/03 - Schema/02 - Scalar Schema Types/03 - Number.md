---
id: schema_type_number
title: Number
---

# Number Schema Type

The number schema type allows you to work with numeric values.

## Schema Definition Properties

In addition to the [base schema definition properties](../schema_basics#properties-common-to-all-schema-definitions) the `number` type has the following additional properties:

| Property     | Type       |     Mandatory      | Default | Description                                                                                                                       |
| ------------ | ---------- | :----------------: | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `type`       | `"number"` | :heavy_check_mark: |         | The type literal for a number schema type                                                                                         |
| `dbDecimals` | `number`   |                    | `0`     | If specified, decimal values will be converted to and from MultiValue internal format using this number of implied decimal places |

## Formatting

A number schema type will be formatted based upon the value of the `dbDecimals` property in the definition. For instance, if you had a `dbDecimals` value of `2`, the following formats would be applied:

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `12345`        | `123.45`         |

## Example

```ts
const schemaDefinition = {
  numberProperty: {
    type: 'number',
    path: 1,
    dictionary: 'NUMBER_DICT',
    dbDecimals: 2,
  },
};
```
