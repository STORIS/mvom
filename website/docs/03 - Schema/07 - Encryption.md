---
id: schema_encryption
title: Encryption
---

# Encryption

MVOM supports optional transparent data encryption functionality within the schema definitions. MVOM does not provide any native support for encryption but does allow consumers to optionally specify encryption and decryption functions which must be implemented by the user. Encrypt functions are run prior to save operations and decrypt functions are run subsequent to read operations, resulting in the encryption and decryption processes being transparent to consumers.

## Enabling encryption for a schema

The [schema constructor options](./schema_options#options-object-properties) accept two properties: `encrypt` and `decrypt` which are functions that can be provided to encrypt and decrypt data respectively.

### Encrypt function

Prior to saving, all values are initially cast to string representations. For example, a numeric value of `1.23` is cast to `"123"`. The encrypt function, if provided, will then run with this string value being passed as an input parameter. The output of the function should be the encrypted cipher text. The encrypted cipher text will be the value stored in the database.

The signature of the encrypt function is:

```ts
(value: string) => string;
```

### Decrypt function

After data access, the decrypt function, if provided, will be passed the value as it exists in the database. The output of the function should be the string representation of the unencrypted value. Once this value has been determined, the string will be cast into the appropriate data type before being returned to the consumer.

The signature of the decrypt function is:

```ts
(value: string) => string;
```

## Activating encryption for a property

Specifying the `encrypt` and `decrypt` functions for a schema merely enables the ability to allow encryption on properties in the schema. It does not activate encryption for any data by default. In order to enable encryption for a schema property, the `encrypted` property of the schema definition must be set to `true`. Doing so will enable encryption and decryption behaviors for that property as described above.

See the [schema definition properties documentation](./schema_basics#properties-common-to-all-schema-definitions) for more information.
