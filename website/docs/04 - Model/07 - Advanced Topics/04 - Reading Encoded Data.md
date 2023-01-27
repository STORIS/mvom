---
id: model_reading_encoded
title: Reading Encoded Data
---

# Reading Encoded Data

MVOM allows for the reading of data from a DIR-type file as a base-64 encoded string. The static `readFileContentsById` method of the `Model` class can be used for this functionality.

:::info
The file name used to create the `Model` class must have a record in the VOC file pointing to the location on disk where the directory resides.
:::

## readFileContentsById

The `readFileContentsById` method allows for reading a file from a directory and returning a Base-64 Encoded representation of the file's contents.

### Syntax

```ts
static readFileContentsById(id: string, options?: ModelReadFileContentsByIdOptions): Promise<string>
```

### Parameters

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `id`      | `string` | The record ID of the record to read                      |
| `options` | `object` | [Options object](#options-object-properties) (see below) |

#### Options Object Properties

| Property               | Type     | Description                                                                                                                                                                   |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxReturnPayloadSize` | `number` | The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used. |
| `userDefined`          | `object` | The [user defined options](model_user_defined_options) to pass to the database subroutines                                                                                    |

### Example

```ts
const Encoded = connection.model(null, 'SOME_DIRECTORY');

const encoded = await Encoded.readFileContentsById('SOME_FILE');
```

### How It Works

The general workflow of this method is as follows:

1. Read the `VOC` record for the file which was used to create the `Model`
2. Take the path to the file from attribute 2 of the `VOC` record
3. Append a `/` and the id specified to the path
4. Read and encode the contents of the file by passing the full path to the MultiValue Basic `encode` function.
