---
id: schema_type_string
title: String
---

# String Schema Type

The string schema type is the simplest of the schema types supported by MVOM.

## Schema Definition Properties

In addition to the [base schema definition properties](../schema_basics#properties-common-to-all-schema-definition-types) the `string` type has the following additional properties:

| Property     | Type                               |     Mandatory      | Default | Description                                                                                             |
| ------------ | ---------------------------------- | :----------------: | ------- | ------------------------------------------------------------------------------------------------------- |
| `type`       | `"string"`                         | :heavy_check_mark: |         | The type literal for a string schema type                                                               |
| `enum`       | `string[]`                         |                    |         | If specified, value will be validated against this list of allowed values                               |
| `match`      | `RegExp`                           |                    |         | If specified, value will be matched against this regular expression                                     |
| `foreignKey` | [object](#validating-foreign-keys) |                    |         | If specified, value will be validated for foreign key constraints.<br/> See link for details on format. |

## Formatting

A string schema type will not be formatted. The input and output values will remain the same.

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `foo`          | `foo`            |

## Validating enumerations

The `enum` property allows you to specify an array of permitted values for string types. If the value of the property is not in this list an error will be thrown when saving.

## Validating pattern matching

The `match` property allows you to specify a regular expression which will validate the value to determine if there is a match of the regular expression. If the value of the property does not match the regular expression an error will be thrown when saving.

## Validating foreign keys

The `foreignKey` property allows for validation to ensure that the value is a foreign key to a record of one or more file(s). If the value of the property is not a foreign key to at least one of the specified files then an error will be thrown when saving.

### Properties of foreign key validator

| Property       | Type                   |     Mandatory      | Description                                                                                                                                                      |
| -------------- | ---------------------- | :----------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`         | `string` \| `string[]` | :heavy_check_mark: | The name of the file(s) in the MultiValue database to validate against.<br/>Foreign key validation will pass if the value is an id to _any_ of the listed files. |
| `entityName`   | `string`               | :heavy_check_mark: | A friendly name for the foreign entity being validated<br/>Used for validation errors only                                                                       |
| `keysToIgnore` | `string[]`             |                    | A list of keys which will not be validated                                                                                                                       |

#### Example

Consider a value that is intended to be a foreign key to a file named `ITEM`. The structure of the schema definition would be as follows:

```ts
const schemaDefinition = {
  stringWithForeignKeyProperty: {
    type: 'string',
    path: 1,
    dictionary: 'STRING_DICT',
    required: true,
    foreignKey: { file: 'ITEM', entityName: 'item' },
  },
};

const schema = new Schema(schemaDefinition);
```

#### Delimited string foreign key validation

Foreign key validation can also be run against the parts of a delimited string. For instance, if you had a string formatted as `{part1}*{part2}` (i.e. 2 parts with an asterisk delimiter), you can validate one or both parts as separate foreign key validations. In this case, the foreign key validation format is as follows:

| Property         | Type                                                                     |     Mandatory      | Description                                                                                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------ | :----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [key: number]    | [Foreign Key Validator Definition](#properties-of-foreign-key-validator) | :heavy_check_mark: | One or more dynamic integer key values representing the 0-indexed position in the string after being split by the delimiter<br/>The property value's type is the standard foreign key validation object.<br/>Only those parts of the string which are to be validated require a definition (i.e. the undefined parts will be ignored) |
| `splitCharacter` | `string`                                                                 | :heavy_check_mark: | The string's delimiter character                                                                                                                                                                                                                                                                                                      |

##### Example

Consider a string of the format `{itemId}*{locationId}` which is a string delimited by an asterisk where the first part of the string is a foreign key to a file named `ITEM` and the second part of the string is a foreign key to a file named `LOCATION`. The structure of the schema definition would appear as follows:

```ts
const schemaDefinition = {
  compoundStringWithForeignKeyProperty: {
    type: 'string',
    path: 1,
    dictionary: 'STRING_DICT',
    required: true,
    foreignKey: {
      0: { file: 'ITEM', entityName: 'item' },
      1: { file: 'LOCATION', entityName: 'location' },
      splitCharacter: '*',
    },
  },
};

const schema = new Schema(schemaDefinition);
```

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

const schema = new Schema(schemaDefinition);
```
