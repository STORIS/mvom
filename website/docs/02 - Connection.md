---
id: connection
title: Connection
---

# Connection

The first step to working with MVOM is to establish a connection to the database server via MVIS. Establishing a connection is facilitated via the `Connection` class which is exported from MVOM as a named export.

## Creating a connection

A connection to the database server is established using the `createConnection` static factory method of the `Connection` class. Calling this method will return an instance of the `Connection` class.

### Syntax

```ts
Connection.createConnection(mvisUri: string, account: string, options?: CreateConnectionOptions): Connection
```

### Parameters

| Parameter | Type     | Description                                              | Example              |
| --------- | -------- | -------------------------------------------------------- | -------------------- |
| `mvisUri` | `string` | The URI to the MVIS server instance                      | `http://foo.bar.com` |
| `account` | `string` | The account name as defined in MVIS configuration        | `demo`               |
| `options` | `object` | [Options object](#options-object-properties) (see below) |                      |

#### Options Object Properties

| Property               | Type          | Default       | Description                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logger`               | `Logger`      |               | An object implementing the [Logger](#logger-interface) interface, used for logging messages emitted by MVOM                                                                                                                                                                                                                                                                                                                            |
| `cacheMaxAge`          | `number`      | `3600`        | The maximum age of cached connection information, such as the current database date                                                                                                                                                                                                                                                                                                                                                    |
| `timeout`              | `number`      | `0`           | The request timeout in milliseconds (0 to disable)                                                                                                                                                                                                                                                                                                                                                                                     |
| `httpAgent`            | `http.Agent`  |               | An `http.Agent` instance to use with http requests (recommended)                                                                                                                                                                                                                                                                                                                                                                       |
| `httpsAgent`           | `https.Agent` |               | An `https.Agent` instance to use with https requests (recommended)                                                                                                                                                                                                                                                                                                                                                                     |
| `maxReturnPayloadSize` | `number`      | `100_000_000` | The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. Returning large payloads can have a significant impact on performance and is often the result of invalid database records or an improperly configured query; ie forgetting to use pagination. Tune this value to match your datasets and the type of queries you issue. This can also be configured on a per request basis. |

### Example

```ts
import { Connection } from 'mvom';

const mvisUri = 'http://foo.bar.com';
const account = 'demo';
const options = { timeout: 30_000 };

const connection = Connection.createConnection(mvisUri, account, options);
```

## Opening a connection

After a `Connection` instance has been created, the connection must be opened before it can be used. The process of opening a connection will contact the MultiValue server and verify that the necessary database server subroutines have been installed. If they are available then the connection will be ready for use.

### Syntax

```ts
open(options?: OpenOptions): Promise<void>
```

### Parameters

| Parameter | Type     | Description                                              | Example |
| --------- | -------- | -------------------------------------------------------- | ------- |
| `options` | `object` | [Options object](#options-object-properties) (see below) |         |

#### Options Object Properties

| Property    | Type     | Default                 | Description                                                                                |
| ----------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `requestId` | `string` | randomly generated UUID | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id` |

### Example

```ts
import { Connection } from 'mvom';

const mvisUri = 'http://foo.bar.com';
const account = 'demo';
const connectOptions = { timeout: 30_000 };
const openOptions = { requestId: 'trace' };

const makeConnection = async (): Connection => {
  const connection = Connection.createConnection(mvisUri, account, options);
  await connection.open(openOptions);
  return connection;
};

export default makeConnection;
```

## Deploying MVOM database server features

MVOM requires a number of database server subroutines (referred to by MVOM as _server features_) in order to perform its functionality on the database. If those subroutines are not available then a connection cannot be established. The connection instance allows for manually deploying those subroutines. The deployed subroutines will be cataloged globally for performance considerations. It is recommended to add handling for failed connections due to missing subroutines so that they are automatically deployed and the connection retried, but it is up to you when and how to deploy the subroutines. The `open` method will throw an `InvalidServerFeaturesError` if the subroutines are out of date and this error can be utilized as a trigger for deploying the subroutines.

### Syntax

```ts
deployFeatures(sourceDir: string, options?: DeployFeaturesOptions)
```

### Parameters

| Parameter   | Type     | Description                                                                | Example   |
| ----------- | -------- | -------------------------------------------------------------------------- | --------- |
| `sourceDir` | `string` | The directory on the database server where the subroutines will be created | `mvom.bp` |
| `options`   | `object` | [Options object](#options-object-properties-1) (see below)                 |           |

#### Options Object Properties

| Property    | Type      | Default | Description                                                  |
| ----------- | --------- | ------- | ------------------------------------------------------------ |
| `createDir` | `boolean` | `false` | Create the directory prior to deploying if it is not present |

### Example

```ts
import { Connection, InvalidServerFeaturesError } from 'mvom';

const mvisUri = 'http://foo.bar.com';
const account = 'demo';
const options = { timeout: 30_000 };
const sourceDir = 'mvom.bp';

const makeConnection = async (): Connection => {
  const connection = Connection.createConnection(mvisUri, account, options);
  try {
    await connection.open();
  } catch (connectionErr) {
    if (connectionErr instanceof InvalidServerFeaturesError) {
      // server code is out-of-date - try updating the features
      await connection.deployFeatures(sourceDir, { createDir: true });
      await connection.open();
    } else {
      // something other than server code being out of date -- rethrow
      throw connectionErr;
    }
  }
  return connection;
};

export default makeConnection;
```

## Getting the current database date

Using the connection instance, you can access the database server's current date in ISO 8601 date format (`YYYY-MM-DD`).

### Syntax

```ts
getDbDate(options?: GetDbDateOptions): Promise<string>
```

### Parameters

| Parameter | Type     | Description                                              | Example |
| --------- | -------- | -------------------------------------------------------- | ------- |
| `options` | `object` | [Options object](#options-object-properties) (see below) |         |

#### Options Object Properties

| Property    | Type     | Default                 | Description                                                                                |
| ----------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `requestId` | `string` | randomly generated UUID | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id` |

## Getting the current database time

Using the connection instance, you can access the database server's current time in ISO 8601 time format (`HH:MM:SS.SSS`).

### Syntax

```ts
getDbTime(options?: GetDbTimeOptions): Promise<string>
```

### Parameters

| Parameter | Type     | Description                                              | Example |
| --------- | -------- | -------------------------------------------------------- | ------- |
| `options` | `object` | [Options object](#options-object-properties) (see below) |         |

#### Options Object Properties

| Property    | Type     | Default                 | Description                                                                                |
| ----------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `requestId` | `string` | randomly generated UUID | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id` |

## Getting the current database date-time

Using the connection instance, you can access the database server's current date-time in ISO 8601 date-time format (`YYYY-MM-DDTHH:MM:SS.SSS`).

### Syntax

```ts
getDbDateTime(options?: GetDbDateTimeOptions): Promise<string>
```

### Parameters

| Parameter | Type     | Description                                              | Example |
| --------- | -------- | -------------------------------------------------------- | ------- |
| `options` | `object` | [Options object](#options-object-properties) (see below) |         |

#### Options Object Properties

| Property    | Type     | Default                 | Description                                                                                |
| ----------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `requestId` | `string` | randomly generated UUID | A request/trace ID to be passed to MVIS as a request header with the key `X-MVIS-Trace-Id` |

## Logger interface

MVOM allows passing a logger to the connection instance which will have one of its methods executed whenever MVOM logs a message for debugging or error purposes. The logger object has the following interface:

```ts
interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  verbose(message: string): void;
  debug(message: string): void;
  silly(message: string): void;
}
```

Any object implementing the `Logger` interface can be passed as an option when creating the connection. What you choose to do in your methods is totally up to you, but it can be helpful to provide a logger as it will make debugging and diagnosing any errors significantly easier.

### Example

```ts
import { Connection } from 'mvom';

const logger = {
  error: (message: string) => {
    console.error(message);
  },
  warn: (message: string) => {
    console.warn(message);
  },
  info: (message: string) => {
    console.log(message);
  },
  verbose: (message: string) => {
    console.log(message);
  },
  debug: (message: string) => {
    console.log(message);
  },
  silly: (message: string) => {
    console.log(message);
  },
};

const mvisUri = 'http://foo.bar.com';
const account = 'demo';
const options = { timeout: 30_000, logger };

const connection = Connection.createConnection(mvisUri, account, options);
```
