// TypeScript Version: 2.3

declare namespace mvom {
  export type GenericObject = Record<string, any>

  export enum connectionStatus {
    DISCONNECTED = 'disconnected',
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
  }

  interface Logger {
    error(): void,
    warn(): void,
    info(): void,
    verbose(): void,
    debug(): void,
    silly(): void,
  }

  class Connection {
    constructor(opts: {connectionManagerUri: string, account: string, logger: Logger, cacheMaxAge: number, timeout: number});
    open(): Promise<void>;
    deployFeatures(sourceDir: string, options?: {createDir?: boolean}): Promise<void>;
    getDbDate(): Promise<string>;
    getDbDateTime(): Promise<string>;
    getDbTime(): Promise<string>;
    model(schema: Schema | null, file: string): typeof Model;
    status: connectionStatus;
  }

  function createConnection(connectionManagerUri: string, account: string, opts?: {
    logger?: Logger,
    cacheMaxAge?: number,
    timeout?: number
  }): Connection;


  class Model {
    constructor(data?: GenericObject, opts?: { _id?: string });
    static deleteById(id: string): Promise<Model|null>;
    static find(selectionCriteria?: GenericObject, options?: findOptions): Promise<Model[]>;
    static findAndCount(selectionCriteria?: GenericObject, options?: findOptions): Promise<{
      documents: Model[],
      count: number,
    }>;
    static findById(id: string): Promise<Model>;
    static findByIds(ids: string|string[]): Promise<Model[]>;
    save(): Promise<Model>;
    _id: string | null;
    readonly __v: string | null;
    [index: string]: any;
  }

  interface findOptions {
    skip?: number,
    limit?: number|null,
    sort?: (string | [string, 1 | -1])[],
  }

  export class ISOTimeType {
    private constructor();
  }

  export class ISOCalendarDateType {
    private constructor();
  }

  export class ISOCalendarDateTimeType {
    private constructor();
  }

  export class Schema {
    constructor(definition: GenericObject, opts?: {typeProperty?: string, dictionaries?: GenericObject});
    static Types: {
      ISOCalendarDateTime: typeof ISOCalendarDateTimeType;
      ISOCalendarDate: typeof ISOCalendarDateType;
      ISOTime: typeof ISOTimeType;
    };
  }

  export namespace Errors {
    abstract class Base extends Error {
      constructor(opts?: {message?: string, name?: string, [key: string]: any});
      source: 'mvom';
      name: string;
      other: GenericObject;
    }
    class ConnectionManagerError extends Base {
      constructor(opts?: {message?: string, connectionManagerRequest?: GenericObject, connectionManagerResponse?: GenericObject, [key: string]: any});
      name: 'ConnectionManagerError';
      connectionManagerRequest: GenericObject;
      connectionManagerResponse: GenericObject;
    }
    class DataValidationError extends Base {
      constructor(opts?: {message?: string, validationErrors?: GenericObject, [key: string]: any});
      name: 'DataValidationError';
      validationErrors: GenericObject;
    }
    class DbServerError extends Base {
      constructor(opts?: {message?: string, errorCode?: GenericObject, [key: string]: any});
      name: 'DbServerError';
    }
    class InvalidParameterError extends Base {
      constructor(opts?: {message?: string, parameterName?: string, [key: string]: any});
      name: 'InvalidParameterError';
      parameterName: string;
    }
    class InvalidServerFeaturesError extends Base {
      constructor(opts?: {message?: string, invalidFeatures?: string[], [key: string]: any});
      name: 'InvalidServerFeaturesError';
      invalidFeatures: string[];
    }
    class NotImplementedError extends Base {
      constructor(opts?: {message?: string, methodName?: string, className?: string, [key: string]: any});
      name: 'NotImplementedError';
      methodName: string;
      className: string;
    }
    class RecordLockedError extends Base {
      constructor(opts?: {message?: string, [key: string]: any});
      name: 'RecordLockedError';
    }
    class RecordVersionError extends Base {
      constructor(opts?: {message?: string, [key: string]: any});
      name: 'RecordVersionError';
    }
    class TransformDataError extends Base {
      constructor(opts?: {message?: string, transformClass?: string, transformValue?: any, [key: string]: any});
      name: 'TransformDataError';
      transformClass: string;
      transformValue: any;
    }
  }
}

export = mvom;
