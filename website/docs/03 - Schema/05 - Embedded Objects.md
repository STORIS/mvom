---
id: schema_embedded_objects
title: Embedded Objects
---

# Embedded Objects

MVOM will work with the defined schema structure to produce an object that follows the structure of the schema. That is, a property of a schema definition can also be a schema definition. In this way, an object can be embedded in the parent object. This allows for relating data that might be semantically understood more easily if it was held in a contained object rather than being properties of the parent object.

## Example

Consider a file containing customer information that has several attributes which represent the parts of a name: prefix/title, first/given name, middle name, last/family name, and suffix. Along with those attributes, there are several other attributes defining information about that customer. You could simply define a schema with properties such as `givenName` and `familyName`, or you can create an embedded schema definition such as this example:

```ts
const schemaDefinition = {
  name: {
    prefix: {
      type: 'string',
      path: 1,
    },
    given: {
      type: 'string',
      path: 2,
    },
    middle: {
      type: 'string',
      path: 3,
    },
    family: {
      type: 'string',
      path: 4,
    },
    suffix: {
      type: 'string',
      path: 5,
    },
  },
  someOtherData: {
    type: 'string',
    path: 6,
  },
};
```

This schema would transform into a data structure in the following format:

```ts
{
  name: {
    prefix: 'Ms.',
    given: 'Jane',
    middle: null,
    family: 'Doe',
    suffix: null,
  },
  someOtherData: 'some other string data'
}
```
