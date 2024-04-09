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

| Property       | Type                                 | Description                                                                                             |
| -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `dictionaries` | [object](#dictionaries-object)       | Object defining additional dictionaries not defined in the schema for use in queries                    |
| `idMatch`      | `RegExp`                             | If specified, the `_id` of the object will be matched against this regular expression                   |
| `idForeignKey` | [object](#validating-id-foreign-key) | If specified, value will be validated for foreign key constraints.<br/> See link for details on format. |
| `encrypt`      | `Function`                           | If specified, an encryption function to use with encrypted schema properties                            |
| `decrypt`      | `Function`                           | If specified, a decryption function to use with encrypted schema properties                             |

### Dictionaries object

The `dictionaries` property in the schema options allows you to specify additional dictionaries which can be used in queries. These would be for dictionaries that are not added to a schema definition and would typically be used for virtual or "I-Type" dictionaries.

The object is generally used as key-value pairings that map a property name to the dictionary ID that will correspond with that name. This is similar to how a schema definition will have a property name and a dictionary name defined. Once defined, the properties can then be used for querying purposes just like any schema definition property with a defined dictionary.

#### Example

```ts
const dictionaries = {
  customerId: 'CUST_ID',
  openBalance: 'OPEN_BAL',
};

const schema = new Schema({...}, { dictionaries });
```

#### Defining type information for dictionaries

Although most data types can be used without any need to convert formatting (e.g. string or numeric types), some dictionary types have different internal and external representations such as date and boolean. For example, a boolean represented in the MultiValue database will be stored as `1` or `0` while in JavaScript it would be represented by `true` or `false`. For dictionaries added via a schema definition, this conversion is performed implicitly since type information must be included in a schema definition. That is, a query issued using a schema defined `boolean` will automatically be converted from `true` to `1` and `false` to `0`.

However, using the simple key-value pairing convention indicated above, there is no mechanism to ascertain data types for the dictionaries. Therefore, an alternate format can be used where the value for each key is instead an object which allows for specification of a data type as well as additional meta information to allow for proper type casting.

Although any scalar schema type can be defined in this manner (which can be helpful for documentation purposes), it is generally only necessary for `boolean`, `ISOCalendarDate`, `ISOTime`, and `ISOCalendarDateTime` data types to use this convention. `string` and `number` do not require this as there is no conversion needed for the former and the query engine will properly handle the latter automatically.

| Property     |                                                     Type                                                      | Description                                                                                                                                                                                                                                                                                |
| ------------ | :-----------------------------------------------------------------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`       | `"string"`<br/>`"number"`<br/>`"boolean"`<br/>`"ISOCalendarDate"`<br/>`"ISOTime"`<br/>`"ISOCalendarDateTime"` | The data type of the value                                                                                                                                                                                                                                                                 |
| `dictionary` |                                                   `string`                                                    | The name of the dictionary to associate with the property name                                                                                                                                                                                                                             |
| `dbFormat`   |                                                `"s"` \| `"ms"`                                                | Used only with `ISOTime` and `ISOCalendarDateTime` types to indicate the format of the time value.<br/>See the docs on [ISOTime](./Scalar%20Schema%20Types/schema_type_isotime) and [ISOCalendarDateTime](./Scalar%20Schema%20Types/schema_type_isocalendardatetime) for more information. |

##### Example

```ts
const dictionaries = {
  customerId: { type: 'string', dictionary: 'CUST_ID' },
  openBalance: { type: 'number', dictionary: 'OPEN_BAL' },
  isActive: { type: 'boolean', dictionary: 'ACTIVE' },
  createDate: { type: 'ISOCalendarDate', dictionary: 'CREATE_DATE' },
  lastActivity: { type: 'ISOCalendarDateTime', dictionary: 'LAST_ACTIVITY', dbFormat: 'ms' },
};

const schema = new Schema({...}, { dictionaries });
```

### Validating ID pattern matching

The `idMatch` property allows you to specify a regular expression which will validate the `_id` value of an object to determine if there is a match of the regular expression. If the value of `_id` property does not match the regular expression an error will be thrown when saving.

Related: [Validating pattern matching in strings](./Scalar%20Schema%20Types/schema_type_string#validating-pattern-matching)

### Validating ID foreign key

The `idForeignKey` property allows you to specify a foreign key definition for the `_id` property. See the [validating foreign keys](./Scalar%20Schema%20Types/schema_type_string#validating-foreign-keys) section of the string schema type documentation for more details.

### Encryption

See [encryption](./schema_encryption) for more information.
