---
id: schema_type_isotime
title: ISOTime
---

# ISOTime Schema Type

The ISOTime schema type allow you to work with time values.

## Schema Definition Properties

In addition to the [base schema definition properties](../schema_basics#properties-common-to-all-schema-definition-types) the `ISOTime` type has the following additional properties:

| Property   | Type            |     Mandatory      | Default | Description                                                                                   |
| ---------- | --------------- | :----------------: | ------- | --------------------------------------------------------------------------------------------- |
| `type`     | `"ISOTime"`     | :heavy_check_mark: |         | The type literal for an ISOTime schema type                                                   |
| `dbFormat` | `"s"` \| `"ms"` |                    | `"s"`   | `"s"` denotes internal time is in seconds<br/>`"ms"` denotes internal time is in milliseconds |

## Formatting

An ISOTime schema type will be transformed to and from MultiValue internal time representation to ISO 8601 times (`HH:MM:SS.SSS`). The transformations are conditional based upon the `dbFormat` property value.

### dbFormat = "s"

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `0`            | `"00:00:00.000"` |
| `43200`        | `"12:00:00.000"` |

### dbFormat = "ms"

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `0`            | `"00:00:00.000"` |
| `43200123`     | `"12:00:00.123"` |

## Example

```ts
const schemaDefinition = {
  timeProperty: {
    type: 'ISOTime',
    path: 1,
    dictionary: 'TIME_DICT',
    required: true,
    dbFormat: 's',
  },
};

const schema = new Schema(schemaDefinition);
```
