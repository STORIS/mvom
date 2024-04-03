---
id: model_query_operators
title: Query Conditional Operators
---

# Query Conditional Operators

MVOM supports a number of query operators to use for filtering the results of a query.

All examples on this page are working with a `Model` constructed in the following manner:

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');
```

## Equality Operator

The equality operator is `$eq`. This operator will find records where the property's value is equal to the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $eq: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE = "100"
```

### Implicit Equality Operator

When querying for equality, it is not necessary to use the `$eq` operator. The following query condition filter object format will implicitly assume equality without the need for specifying the `$eq` operator.

```ts
{
  propertyName: conditionalValue;
}
```

#### Example

This example illustrates using the implicit equality syntax to execute the same query as shown using the explicit equality operator.

```ts
const items = await Item.find({ price: 100 });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE = "100"
```

## Greater than operator

The greater than operator is `$gt`. This operator will find records where the property's value is greater than the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $gt: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE > "100"
```

## Greater than or equal to operator

The greater than or equal to operator is `$gte`. This operator will find records where the property's value is greater than or equal to the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $gte: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE >= "100"
```

## Less than operator

The less than operator is `$lt`. This operator will find records where the property's value is less than the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $lt: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE < "100"
```

## Less than or equal to operator

The less than or equal to operator is `$lte`. This operator will find records where the property's value is less than or equal to the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $lte: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE <= "100"
```

## Not Equal Operator

The not equal operator is `$ne`. This operator will find records where the property's value is not equal to the provided conditional value.

### Example

```ts
const items = await Item.find({ price: { $ne: 100 } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE # "100"
```

## Contains operator

The contains operator is `$contains`. This operator will find records where the property's value contains the provided conditional value.

### Example

```ts
const items = await Item.find({ description: { $contains: 'Bed' } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with DESCRIPTION like "...Bed..."
```

:::warning[caution]
Queries with the `$contains` operator cannot include single or double quotes (`'` or `"`) in the query constant value.
:::

## Starts With Operator

The starts with operator is `$startsWith`. This operator will find records where the property's value starts with the provided conditional value.

### Example

```ts
const items = await Item.find({ description: { $startsWith: 'Bed' } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with DESCRIPTION like "Bed..."
```

:::caution
Queries with the `$startsWith` operator cannot include single or double quotes (`'` or `"`) in the query constant value.
:::

## Ends With Operator

The ends with operator is `$endsWith`. This operator will find records where the property's value ends with the provided conditional value.

### Example

```ts
const items = await Item.find({ description: { $endsWith: 'Bed' } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with DESCRIPTION like "...Bed"
```

:::caution
Queries with the `$endsWith` operator cannot include single or double quotes (`'` or `"`) in the query constant value.
:::

## In Operator

The in operator is `$in`. Unlike most other operators, the `$in` operator accepts an array of conditional values. This operator will find records where the property's value is equal to any of the values provided in the array.

### Example

```ts
const items = await Item.find({ description: { $in: ['Bed', 'Chair', 'Couch'] } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION = "Bed" or DESCRIPTION = "Chair" or DESCRIPTION = "Couch")
```

### Implicit In Operator

When querying for properties matching any of a list, it is not necessary to use the `$in` operator. The following query condition filter object format will implicitly assume "in" without the need for specifying the `$in` operator. This works similarly to the [implicit equality operator](#implicit-equality-operator) except the conditional value will be an array.

```ts
{
  propertyName: [conditionalValue1, conditionalValue2];
}
```

#### Example

This example illustrates using the implicit in operator syntax to execute the same query as shown using the explicit in operator.

```ts
const items = await Item.find({ description: ['Bed', 'Chair', 'Couch'] });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION = "Bed" or DESCRIPTION = "Chair" or DESCRIPTION = "Couch")
```

## Not In Operator

The not in operator is `$nin`. Unlike most other operators, the `$nin` operator accepts an array of conditional values. This operator will find records where the property's value is not equal to any of the values provided in the array.

### Example

```ts
const items = await Item.find({ description: { $nin: ['Bed', 'Chair', 'Couch'] } });
```

The query which will be executed on the MultiValue database is:

```
select ITEM with (DESCRIPTION # "Bed" and DESCRIPTION # "Chair" and DESCRIPTION # "Couch")
```
