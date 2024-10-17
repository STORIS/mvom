---
id: model_incrementing
title: Incrementing a Property on a Model
---

# Incrementing a Property on a Model

MVOM allows incrementing numeric properties on a record by specifying the id of the record, the valid string path to the property, and the value to increment the numeric property by. This operation is often used in scenarios such as updating a counter or tracking the number of times an event has occurred. The `Model` class exposes a static method `increment` to support this ability.

## increment Method

The `increment` static method is available on all `Model` classes. It allows a consumer to specify a record id and an array of `IncrementOperation`s that define the string key `path` to the numeric property to increment and the `value` to increment by, which will initiate a call to the MultiValue database to increment the properties provided in the parameters. It will return a `Model` instance of the original record and the updated record. If the record does not exist, a `RecordNotFoundError` will be thrown; it will be up to the consumer to handle the error (ie. create the record by initiating a `save` operation or something else). If the record is locked, it will retry the operation 5 times, delaying 1 second between each retry by default, which can be overridden in the options.

### Syntax

```ts
static increment(id: string, operations: IncrementOperation<TSchema>[], options?: ModelIncrementOptions): Promise<ModelIncrementResult<TSchema>>
```

### Parameters

| Parameter    | Type                            | Description                                                                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`         | `string`                        | The record ID of the record to increment                                                                                                                                                                                                                                                                           |
| `operations` | `IncrementOperation<TSchema>[]` | An array of `IncrementOperation` objects that define the string key path to the numeric property to increment and the value to increment by. The `path` is inferred using the schema (That is what the `TSchema` type parameter is used for) and will only allow valid paths to numeric properties to be provided. |
| `options`    | `object`                        | [Options object](#options-object-properties) (see below)                                                                                                                                                                                                                                                           |

#### IncrementOperation Type

The `IncrementOperation` type is an object that defines the string key `path` to the numeric property to increment and the `value` to increment by. The `TSchema` type parameter is used to infer the key path to the numeric property to increment using the `Schema` the `Model` was defined with, ensuring only valid paths to numeric properties can be incremented.

:::info
Nested paths are supported using dot notation (ex. `nested.path`), but incrementing indexes in arrays are not supported at this time.
:::

#### Options Object Properties

| Property | Type     | Description                                                                       |
| -------- | -------- | --------------------------------------------------------------------------------- |
| `retry`  | `number` | The number of times to retry the operation if the record is locked. Default is 5. |
| `delay`  | `number` | The delay in seconds between each retry. Default is 1.                            |

### Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1 },
  onHand: { type: 'number', path: 2 },
  purchaseCounts: {
    total: { type: 'number', path: 3 },
  },
});

const Item = connection.model(schema, 'ITEM');

const result = await Item.increment('0001', [{ path: 'onHand', value: 1 }]);

// incrementing nested property purchaseCounts.total
const nestedPropertyIncrementResult = await Item.increment('0001', [
  { path: 'purchaseCounts.total', value: 1 },
]);

// invalid increment operation - type error will be shown because description is not a numeric path
const willNotWork = await Item.increment('0001', [{ path: 'description', value: 1 }]);
```
