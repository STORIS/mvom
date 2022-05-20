---
id: schema_type_boolean
title: Boolean
---

# Boolean Schema Type

The Boolean schema type allows you to work with boolean values.

## Schema Definition Properties

| Property     | Type                 |     Mandatory      | Default | Description                                                            |
| ------------ | -------------------- | :----------------: | ------- | ---------------------------------------------------------------------- |
| `type`       | `"boolean"`          | :heavy_check_mark: |         | The type literal for a boolean schema type                             |
| `path`       | `string` \| `number` | :heavy_check_mark: |         | The [path](../schema_basics#path-property) to the location of the data |
| `dictionary` | `string`             |                    |         | The dictionary name to use for query conditionals for this property    |
| `required`   | `boolean`            |                    | `false` | Indicate whether this property is mandatory                            |
| `encrypted`  | `boolean`            |                    | `false` | Indicate whether this property should be encrypted                     |

## Formatting

Boolean schema types will be transformed to and from MultiValue booleans and JavaScript booleans.

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `0`            | `false`          |
| `1`            | `true`           |

:::info
All "truthy" values from the database will be transformed to `true` and all other values will be transformed to `false`. That is, if you map a database value as `boolean` and the physical database value is not a `0` or a `1`, then the output results will be based on the JavaScript engine's evaluation of truthy and falsy.

If you allow Boolean values to be `null` but that does not imply `false` (i.e. there are 3 possible states), you should use a `string` type with an `enum` constraint.
:::

## Example

```ts
const schemaDefinition = {
  booleanProperty: {
    type: 'boolean',
    path: 1,
    dictionary: 'BOOLEAN_DICT',
  },
};
```
