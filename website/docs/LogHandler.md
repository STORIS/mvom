---
id: loghandler
title: LogHandler
---

# LogHandler

MVOM allows passing a logger to the connection instance which will have one of its methods executed whenever MVOM logs a message for debugging or error purposes. This logger will be passed to the model constructor as a `LogHandler` instance.

## Logger interface

The logger object has the following interface:

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

const mvisUrl = 'http://foo.bar.com';
mvisAdminUrl = 'http://mvis-admin.bar.com';
mvisAdminUsername = 'username';
mvisAdminPassword = 'password';
const account = 'demo';
const options = { timeout: 30_000, logger };

const connection = Connection.createConnection(
  mvisUrl,
  mvisAdminUrl,
  mvisAdminUsername,
  mvisAdminPassword,
  account,
  options,
);
```
