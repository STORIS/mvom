---
id: schema_object_arrays
title: Object Arrays
---

# Object Arrays

MVOM allows schema definitions which produce arrays of objects. In MultiValue terminology, these structures are generally referred to as "associations". They are generally structured as parallel associative arrays where each array index from an attribute is related to the same index in one or more other attributes.

When transforming to and from the MultiValue array structures, MVOM will produce an array of objects. Although you _could_ simply map each of the attributes as arrays and handle the associations manually (as you likely would in MultiValue BASIC), it is far more convenient to treat these associations as a single cohesive unit rather than working with arrays by index position.

## Example

Consider a file with two attributes, each containing an array where each multivalue is associated to the same array index in the other attribute. For example, the data might look like this, with `{vm}` representing value marks:

```
0001  foo{vm}bar{vm}baz
0002  123{vm}234{vm}345
```

You can create an object array by adding a property to a schema definition which is an array containing another schema definition. The above file structure could be defined as follows:

```ts
const schemaDefinition = {
  objectArrayProperty: [
    {
      associativeProperty1: {
        type: 'string',
        path: 1,
        dictionary: 'STRING_ASSOC_PROP1',
        required: true,
      },
    },
    {
      associativeProperty2: {
        type: 'number',
        path: 2,
        dictionary: 'NUMBER_ASSOC_PROP2',
        dbDecimals: 2,
        required: true,
      },
    },
  ],
};

const schema = new Schema(schemaDefinition);
```

The data format above would be transformed into an object-array in the following format:

```ts
{
  objectArrayProperty: [
    {
      associativeProperty1: 'foo',
      associativeProperty2: 1.23,
    },
    {
      associativeProperty1: 'bar',
      associativeProperty2: 2.34,
    },
    {
      associativeProperty1: 'baz',
      associativeProperty2: 3.45,
    },
  ];
}
```
