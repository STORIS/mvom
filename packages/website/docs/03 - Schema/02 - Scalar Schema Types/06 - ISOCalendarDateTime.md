---
id: schema_type_isocalendardatetime
title: ISOCalendarDateTime
---

# ISOCalendarDateTime Schema Type

The ISOCalendarDateTime schema type allow you to work with compound date-time values.

## Schema Definition Properties

In addition to the [base schema definition properties](../schema_basics#properties-common-to-all-schema-definitions) the `ISOCalendarDateTime` type has the following additional properties:

| Property   | Type                    |     Mandatory      | Default | Description                                                                                   |
| ---------- | ----------------------- | :----------------: | ------- | --------------------------------------------------------------------------------------------- |
| `type`     | `"ISOCalendarDateTime"` | :heavy_check_mark: |         | The type literal for an ISOCalendarDateTime schema type                                       |
| `dbFormat` | `"s"` \| `"ms"`         |                    | `"ms"`  | `"s"` denotes internal time is in seconds<br/>`"ms"` denotes internal time is in milliseconds |

## Formatting

:::info
This is not a standard MultiValue internally formatted data type.
:::

An ISOCalendarDateTime schema type will be transformed to and from an internal date-time representation to ISO 8601 times (`YYYY-MM-DDTHH:MM:SS.SSS`). The transformations are conditional based upon the `dbFormat` property value.

### dbFormat = "s"

| Database Value | JavaScript Value            |
| -------------- | --------------------------- |
| `0.00000`      | `"1967-12-31T00:00:00.000"` |
| `19864.43200`  | `"2022-05-20T12:00:00.000"` |

### dbFormat = "ms"

| Database Value   | JavaScript Value            |
| ---------------- | --------------------------- |
| `0.00000000`     | `"1967-12-31T00:00:00.000"` |
| `19864.43200123` | `"2022-05-20T12:00:00.123"` |

## Example

```ts
const schemaDefinition = {
  dateTimeProperty: {
    type: 'ISOCalendarDateTime',
    path: 1,
    dictionary: 'DATE_TIME_DICT',
    required: true,
    dbFormat: 'ms',
  },
};

const schema = new Schema(schemaDefinition);
```
