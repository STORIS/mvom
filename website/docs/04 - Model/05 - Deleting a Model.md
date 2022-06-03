---
id: model_deletion
title: Deleting a Model
---

# Deleting a Model

MVOM allows deleting database records by specifying the iD to the record. The `Model` class exposes a static method `deleteById` to support this ability.

## deleteById Method

The `deleteById` static method is available on all `Model` classes. It allows a consumer to specify a record id which will initiate a call to the MultiValue database to delete that record. It will return an instance of the `Model` that contains the data from the record at the time of deletion. If no record with that ID exists, `null` will be returned.

### Syntax

```ts
static deleteById(id: string, options?: ModelDeleteByIdOptions): Promise<Model | null>
```

### Parameters

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `id`      | `string` | The record ID of the record to read                      |
| `options` | `object` | [Options object](#options-object-properties) (see below) |

#### Options Object Properties

| Property      | Type     | Description                                                                                                    |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `userDefined` | `object` | The [user defined options](./Advanced%20Topics/model_user_defined_options) to pass to the database subroutines |

### Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1 },
  price: { type: 'number', path: 2, dbDecimals: 2 },
});

const Item = connection.model(schema, 'ITEM');

const deletedItem = await Item.deleteById('0001');
```

## Record Delete Notes

### Record Locks

MVOM will reject any database deletes for a record that is currently locked (e.g. a `READU` statement). In this scenario, `deleteById` will reject with a `RecordLockedError`.
