---
id: model_projection
title: Projection
---

# Projection

Consumers do not always want to return the entire contents of a record. In particular, for large records, returning the entirety of the record can increase the size of data transfer payloads and reduce overall performance if all of the data from a record is not needed. To support this behavior, many read operations allow for specification of a `projection` property. This `projection` property allows the consumer to limit the properties returned from the database resulting in reduced data traffic.

:::warning
It is highly advised to never save a `Model` that is instantiated from a read operation using `projection`. Unless you really know what you are doing, this could result in data loss as the `Model` instance will not contain the data that was excluded from the projection.
:::

## Using Projection

For operations which support projection, the behavior can be implemented by specifying the `projection` property. The projection property is an array of strings which correspond to the defined schema property names.

:::info
Any properties which are defined in the schema but are not indicated as a projected property will be assigned a value of `null`. They will continue to exist on the `Model`.
:::

### Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.find({ price: { $gt: 100 } }, { projection: ['description'] });
console.log(items[0].description); // outputs "Racecar Bed"
console.log(items[0].price); // outputs null because price was not included in the projection
```
