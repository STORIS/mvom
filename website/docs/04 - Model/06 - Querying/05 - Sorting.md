---
id: model_query_sorting
title: Sorting
---

# Sorting

Query results can be sorted by using the `sort` property of the [query options](model_query_basics#options-object-properties). `sort` accepts an array of a 2-tuple. The first index of the tuple is the property name associated with a dictionary that you wish to sort on and the second index of the tuple is either `1` to indicate ascending sort or `-1` to indicate descending sort. Sort criteria will be added in the order in which they appear in the array, so this mechanism can be used in order to prioritize sort behavior.

## Example

The following query will sort by descending price as the primary sort condition and by ascending description as the secondary sort condition.

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.find(
  {},
  {
    sort: [
      ['price', -1],
      ['description', 1],
    ],
  },
);
```

The query which will be executed on the MultiValue database is:

```
select ITEM by.dsnd PRICE by DESCRIPTION
```
