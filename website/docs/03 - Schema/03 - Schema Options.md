---
id: schema_options
title: Schema Options
---

# Schema Options

Several options can be passed to the schema constructor. As defined in [Schema Basics](./schema_basics), the syntax of the Schema constructor is:

```ts
constructor(definition: SchemaDefinition, options?: SchemaConstructorOptions): Schema
```

The second parameter is the options object which contains a number of properties which will affect the behavior of the defined Schema.

## Options Object Properties

| Property       | Type                               | Description                                                                                             |
| -------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `dictionaries` | [object](#dictionaries-object)     | Object defining additional dictionaries not defined in the schema for use in queries                    |
| `idMatch`      | `RegExp`                           | If specified, the `_id` of the object will be matched against this regular expression                   |
| `idForeignKey` | [object](#validating-foreign-keys) | If specified, value will be validated for foreign key constraints.<br/> See link for details on format. |
| `encrypt`      | `Function`                         | If specified, an encryption function to use with encrypted schema properties                            |
| `decrypt`      | `Function`                         | If specified, a decryption function to use with encrypted schema properties                             |

### Dictionaries object

### Validating ID pattern matching

The `idMatch` property allows you to specify a regular expression which will validate the `_id` value of an object to determine if there is a match of the regular expression. If the value of `_id` property does not match the regular expression an error will be thrown when saving.

### Validating ID foreign key

The `idForeignKey` property allows you to specify a foreign key definition for the `_id` property. See the [validating foreign keys](./Scalar%20Schema%20Types/schema_type_string#validating-foreign-keys) section of the string schema type documentation for more details.

### Encryption

See [encryption](./schema_encryption) for more information.
