---
id: model_query_multiple_operators
title: Combining Multiple Operators
---

# Combining Multiple Operators

It is common to require specifying multiple query operators in order to filter results by multiple conditions. MVOM supports the ability to specify multiple operators in a variety of ways.

All examples on this page are working with a `Model` constructed in the following manner:

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');
```

## And conditions

There are multiple ways to join conditions via an `and` operator using MVOM.

### Single property

If you have a single property which you wish to have multiple criteria joined by an `and`, you can add each of those criteria to the same object value assigned to the property.

#### Example

The following query will return all records which have a price greater than or equal to 100 and less than 200.

```ts
const items = await Item.find({ price: { $gte: 100, $lt: 200 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (PRICE >= "100" and PRICE < "200")
```

### Explicit And for Multiple Properties

If you have multiple properties which you wish to have their conditions joined by an `and`, you can use the `$and` operator to join those conditions together. The `$and` property accepts an array of query condition filter objects.

#### Example

The following query will return all records which have a description of "Bed" and a price greater than or equal to 100.

```ts
const items = await Item.find({ $and: [{ description: 'Bed' }, { price: { $gte: 100 } }] });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION = "Bed" and PRICE >= "100")
```

### Implicit And for Multiple Properties

It is not necessary to use the explicit `$and` operator if you have multiple properties that you wish to have their conditions joined by an `and`. The `$and` operator is implicit when multiple properties are specified in the query condition filter object.

```ts
const items = await Item.find({ description: 'Bed', price: { $gte: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION = "Bed" and PRICE >= "100")
```

## Or conditions

In order to join conditions via an `or` operator, you would use the `$or` operator to join those conditions together. The `$or` property accepts an array of query condition filter objects.

### Example

The following query will return all records which have a price less than 100 or greater than or equal to 1000.

```ts
const items = await Item.find({ $or: [{ price: { $lt: 100 } }, { price: { $gte: 1000 } }] });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (PRICE < 100 or PRICE >= "1000")
```

## Combining And and Or Conditions

It is possible to combine And and Or conditions into the same query. This is done by simply nesting these join operators within each other to produce more complex queries.

### Example

The following query will return all records which have a description of "Bed" and a price that is less than 100 or greater than or equal to 1000.

```ts
const items = await Item.find({
  $and: [{ description: 'Bed' }, { $or: [{ price: { $lt: 100 } }, { price: { $gte: 1000 } }] }],
});
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION = "Bed" and (PRICE < "100" or PRICE >= "1000"))
```
