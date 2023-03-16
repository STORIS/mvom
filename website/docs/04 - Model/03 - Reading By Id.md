---
id: model_reading_by_id
title: Reading a Model By ID
---

# Reading a Model By ID

MVOM allows reading database records by specifying an ID to the record. The `Model` class offers two static method `findById` and `findByIds` which support this ability.

## findById Method

The `findById` static method is available on all `Model` classes. It allows a consumer to specify a record id which will initiate a call to the MultiValue database to read that record. It will return an instance of the `Model` that contains the data from the record. If no record with that ID exists, `null` will be returned.

### Syntax

```ts
static findById(id: string, options?: ModelFindByIdOptions): Promise<Model | null>
```

### Parameters

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `id`      | `string` | The record ID of the record to read                      |
| `options` | `object` | [Options object](#options-object-properties) (see below) |

#### Options Object Properties

| Property               | Type       | Description                                                                                                                                                                   |
| ---------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projection`           | `string[]` | The [projection](./Advanced%20Topics/model_projection) of properties to return from the database                                                                              |
| `maxReturnPayloadSize` | `number`   | The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used. |
| `requestId`            | `string`   | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id`                                                                                    |
| `userDefined`          | `object`   | The [user defined options](./Advanced%20Topics/model_user_defined_options) to pass to the database subroutines                                                                |

### Example

Assume there is a database record structured as follows:

| Attribute | Value         |
| --------- | ------------- |
| ID        | `0001`        |
| 1         | `Racecar Bed` |
| 2         | `99999`       |

The following code would allow reading of that record:

```ts
const schema = new Schema({
  description: { type: 'string', path: 1 },
  price: { type: 'number', path: 2, dbDecimals: 2 },
});

const Item = connection.model(schema, 'ITEM');

const item = await Item.findById('0001');
```

The value of `item` would be:

```ts
{
  description: "Racecar Bed",
  price: 999.99
}
```

## findByIds Method

The `findByIds` static method is very similar to the `findById` static method. The primary difference between the two is that `findByIds` will accept an array of IDs to read and return an array of `Model` instances. If no record with one of the provided IDs exists, `null` will be returned.

### Syntax

```ts
static findByIds(ids: string | string[], options?: ModelFindByIdOptions): Promise<(Model | null)[]>
```

### Parameters

| Parameter | Type                   | Description                                                |
| --------- | ---------------------- | ---------------------------------------------------------- |
| `ids`     | `string` \| `string[]` | The record ID or IDs of the record(s) to read              |
| `options` | `object`               | [Options object](#options-object-properties-1) (see below) |

#### Options Object Properties

| Property               | Type       | Description                                                                                                                                                                   |
| ---------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projection`           | `string[]` | The [projection](./Advanced%20Topics/model_projection) of properties to return from the database                                                                              |
| `maxReturnPayloadSize` | `number`   | The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used. |
| `requestId`            | `string`   | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id`                                                                                    |
| `userDefined`          | `object`   | The [user defined options](./Advanced%20Topics/model_user_defined_options) to pass to the database subroutines                                                                |

### Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1 },
  price: { type: 'number', path: 2, dbDecimals: 2 },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.findByIds(['0001', '0002']);
```
