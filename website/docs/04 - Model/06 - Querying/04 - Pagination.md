---
id: model_query_pagination
title: Pagination
---

# Pagination

MVOM allows queries to be specified that limit the number of results returned from a query and to skip a number of results that are returned by a query. This is performed using the `limit` and `skip` properties of the [query options](model_query_basics#options-object-properties). These properties can be used independently of one another, but typically they are used together in order to paginate queries.

## Skip

The `skip` property allows the consumer to specify a number of query results to bypass when returning results from the server. For example, if a query returned 50 matching records, but a skip value of `10` was provided as a query option then only records 11 through 50 would be returned from the query's execution.

### Example

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.find({ price: { $gt: 100 } }, { skip: 10 });
```

## Limit

The `limit` property allows the consumer to specify how many results to return. Regardless of how many records match the query conditions, no more than the number specified by the `limit` property will be returned by the query.

### Example

This example code will limit the number of results returned from the query to 100.

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.find({ price: { $gt: 100 } }, { limit: 100 });
```

## Using Skip and Limit Together

`skip` and `limit` can be combined in order to paginate query results. Generally speaking, to paginate you would choose a constant `limit` value to define the number of results per page, but then increment the `skip` value by the value of the `limit` for each subsequent page.

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const firstPage = await Item.find({ price: { $gt: 100 } }, { limit: 100 });
const secondPage = await Item.find({ price: { $gt: 100 } }, { skip: 100, limit: 100 });
const thirdPage = await Item.find({ price: { $gt: 100 } }, { skip: 200, limit: 100 });
```
