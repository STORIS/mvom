---
id: schema_type_isocalendardate
title: ISOCalendarDate
---

# ISOCalendarDate Schema Type

The ISOCalendarDate schema type allow you to work with date values.

## Schema Definition Properties

In addition to the [base schema definition properties](../schema_basics#properties-common-to-all-schema-definition-types) the `ISOCalendarDate` type has the following additional properties:

| Property | Type                |     Mandatory      | Default | Description                                         |
| -------- | ------------------- | :----------------: | ------- | --------------------------------------------------- |
| `type`   | `"ISOCalendarDate"` | :heavy_check_mark: |         | The type literal for an ISOCalendarDate schema type |

## Formatting

An ISOCalendarDate schema type will be transformed to and from MultiValue internal date representation to ISO 8601 dates (`YYYY-MM-DD`):

| Database Value | JavaScript Value |
| -------------- | ---------------- |
| `0`            | `"1967-12-31"`   |
| `19864`        | `"2022-05-20"`   |

## Example

```ts
const schemaDefinition = {
  dateProperty: {
    type: 'ISOCalendarDate',
    path: 1,
    dictionary: 'DATE_DICT',
    required: true,
  },
};

const schema = new Schema(schemaDefinition);
```
