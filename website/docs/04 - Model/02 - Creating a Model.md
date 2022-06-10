---
id: model_creation
title: Creating a Model
---

# Creating a Model

Model instances are typically created by consumers for the purpose of inserting a new record into the database.

## Syntax

```ts
constructor(options: ModelConstructorOptions): Model
```

### Model Constructor Options Properties

| Property | Type     | Description                                                                                                                                                                                                                                                                                |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_id`    | `string` | The identifier of the model. It will be the record ID upon saving.                                                                                                                                                                                                                         |
| `data`   | `object` | An object whose properties will be assigned into the Model instance.<br/>Effectively, this allows for an easy mechanism to instantiate a new Model with the properties and values which should be assigned to it.                                                                          |
| `__v`    | `string` | The version of the Model. See the [\_\_v Property](./Advanced%20Topics/model_version) documentation for more information.<br/> It is uncommon for consumers to set this property.                                                                                                          |
| `record` | `string` | An alternative way to supply data to a `Model` instance. This property accepts a MultiValue delimited string (i.e. containing attribute marks, value marks) and will add properties to the model based upon the record's structure.<br/>It is uncommon for consumers to set this property. |

## Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1 },
  price: { type: 'number', path: 2, dbDecimals: 2 },
});

const Item = connection.model(schema, 'ITEM');

const item = new Item({ _id: '0001', data: { description: 'Racecar Bed', price: 999.99 } });

console.log(item.description); // outputs "Racecar Bed"
```
