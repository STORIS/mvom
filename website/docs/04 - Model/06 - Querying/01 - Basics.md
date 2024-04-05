---
id: model_query_basics
title: Query Basics
---

# Query Basics

MVOM allows consumers to execute queries against the database via the defined schema associated with a `Model` instance. Queries are constructed using MVOM's query language which are then translated into MultiValue queries. The results of the query are then returned as `Model` instances. MVOM exposes two static methods for issuing queries: `find` and `findAndCount`.

## find Method

The `find` method accepts an MVOM query condition object and returns an array of `Model` instances which matched the query's conditions.

### Syntax

```ts
static find(queryCondition: Filter, options?: ModelFindOptions): Promise<Model[]>
```

### Parameters

| Parameter        | Type     | Description                                                             |
| ---------------- | -------- | ----------------------------------------------------------------------- |
| `queryCondition` | `object` | The [query condition filter object](#the-query-condition-filter-object) |
| `options`        | `object` | [Options object](#options-object-properties)                            |

#### Options Object Properties

| Property               | Type                                  | Description                                                                                                                                                                   |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skip`                 | `number`                              | The number of matching records to skip when returning results. See [pagination](model_query_pagination).                                                                      |
| `limit`                | `number`                              | The number of matching records to return in the result set. See [pagination](model_query_pagination).                                                                         |
| `sort`                 | <code>[string, -1 &#124; 1 ][]</code> | The sort criteria for the query. See [sorting](model_query_sorting).                                                                                                          |
| `projection`           | `string[]`                            | The [projection](../Advanced%20Topics/model_projection) of properties to return from the database                                                                             |
| `maxReturnPayloadSize` | `number`                              | The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used. |
| `requestId`            | `string`                              | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id`                                                                                    |
| `userDefined`          | `object`                              | The [user defined options](../Advanced%20Topics/model_user_defined_options) to pass to the database subroutines                                                               |

## findAndCount Method

The `findAndCount` method accepts an MVOM query condition object and returns an array of `Model` instances which matched the query's conditions as well as a count of the total number of records which matched the query's conditions. This count value can be useful when executing [paginated queries](model_query_pagination).

### Syntax

```ts
static findAndCount(queryCondition: Filter, options?: ModelFindOptions): Promise<ModelFindAndCountResult>
```

### Parameters

The parameters for `findAndCount` are the same as for [find](#parameters).

### Return Value

The return value of `findAndCount` is an object with the following properties:

| Property    | Type      | Description                                                   |
| ----------- | --------- | ------------------------------------------------------------- |
| `count`     | `number`  | The total number of records which matched the query condition |
| `documents` | `Model[]` | The `Model` instances which were returned by the query        |

## The Query Condition Filter Object

When issuing queries, a query condition filter object must be passed to the `find` or `findAndCount` methods. This query condition filter object has properties which correspond to the properties of the `Schema` which are assigned values which define the condition for the query. The general format of a query condition filter object is:

```ts
{
  propertyName1: {
    conditionalOperator: conditionalValue,
  },
  propertyName2: {
    conditionalOperator: conditionalValue,
  }
}
```

:::info
In order to use a property for a query it must either be a property defined in the schema with a specified [dictionary](../../Schema/schema_basics#properties-common-to-all-schema-definition-types) value or a property defined in the [dictionaries object](../../Schema/schema_options#dictionaries-object) of the schema options.
:::

### Example

Consider a scenario where you want to query for all items which have a price greater than 100. The following example code illustrates construction of a query to satisfy that requirement.

```ts
const schema = new Schema({
  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },
  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },
});

const Item = connection.model(schema, 'ITEM');

const items = await Item.find({ price: { $gt: 100 } });
```

In the above example, `price` is the schema property which is being queried against. `$gt` is the greater than operator and `100` is the value to be compared.

The query which will be executed on the MultiValue database is:

```
select ITEM with PRICE > "100"
```

:::tip
If you provide a [logger](../../connection#logger-interface) to your `Connection`, the transformed MultiValue query will be passed to the `debug` method.
:::
