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

  type RecordTemplate = (( string | null ) | (string | null)[] | (string | null)[][])[]

  class Model extends Document {
    constructor(opts?: { _id?: string, data?: GenericObject, record?: RecordTemplate });
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
  }

  class Document {
    constructor(schema: Schema | null, options?: { data?: GenericObject, isSubdocument?: boolean, record?: RecordTemplate });
    [index: string]: unknown;
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

  export type DecryptFunc = {
    (data: string | null): string | null;
    (data: (string | null)[]): (string | null)[];
  }

  export type EncryptFunc = {
    (data: string | null): string | null;
    (data: (string | null)[]): (string | null)[];
  }

  export interface SchemaOpts {
    typeProperty?: string;
    dictionaries?: GenericObject;
    idMatch?: RegExp;
    idForeignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
    encrypt?: EncryptFunc;
    decrypt?: DecryptFunc
  }

  type ISOCalendarDateTime = typeof ISOCalendarDateTimeType;
  type ISOCalendarDate = typeof ISOCalendarDateType;
  type ISOTime = typeof ISOTimeType;

  export interface SchemaForeignKeyDefinition {
    file: string | string[];
    keysToIgnore?: string[];
    entityName: string;
  }

  interface PositionForeignKeyDefinition {
    [key: number]: SchemaForeignKeyDefinition;
  }

  export type SchemaCompoundForeignKeyDefinition = PositionForeignKeyDefinition & {
    splitCharacter: string;
  };

  interface BaseSchemaProperty {
    path: string | number;
    dictionary?: string;
    required?: boolean;
    encrypted?: boolean;
  }

  export interface SchemaStringProperty extends BaseSchemaProperty {
    type: StringConstructor;
    enum?: string[];
    match?: RegExp;
    foreignKey?: SchemaForeignKeyDefinition | SchemaCompoundForeignKeyDefinition;
  }

  export interface SchemaNumberProperty extends BaseSchemaProperty {
    type: NumberConstructor;
    dbDecimals?: number;
  }

  export interface SchemaBooleanProperty extends BaseSchemaProperty {
    type: BooleanConstructor;
  }

  export interface SchemaISOCalendarDateTimeProperty extends BaseSchemaProperty {
    type: ISOCalendarDateTime;
    dbFormat?: 's' | 'ms';
  }

  export interface SchemaISOCalendarDateProperty extends BaseSchemaProperty {
    type: ISOCalendarDate;
  }

  export interface SchemaISOTimeProperty extends BaseSchemaProperty {
    type: ISOTime;
    dbFormat?: 's' | 'ms';
  }

  export type SchemaPropertyTypes = SchemaStringProperty | SchemaNumberProperty | SchemaBooleanProperty | SchemaISOCalendarDateProperty | SchemaISOCalendarDateTimeProperty | SchemaISOTimeProperty;

  export interface SchemaDefinition {
    [x: string]: SchemaPropertyTypes | SchemaPropertyTypes[] | SchemaPropertyTypes[][] | SchemaDefinition | SchemaDefinition[] | SchemaDefinition[][];
  }

  export class Schema {
    constructor(definition: SchemaDefinition, opts?: SchemaOpts);
    static Types: {
      ISOCalendarDateTime: ISOCalendarDateTime;
      ISOCalendarDate: ISOCalendarDate;
      ISOTime: ISOTime;
    };
  }

  export namespace Errors {
    interface ForeignKeyValidationErrorData {
      entityName: string;
      entityId: string;
    }
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
    class ForeignKeyValidationError extends Base {
      constructor(opts?: {message?: string, foreignKeyValidationErrors?: ForeignKeyValidationErrorData[], [key: string]: any});
      name: 'ForeignKeyValidationError';
      foreignKeyValidationErrors: ForeignKeyValidationErrorData[];
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
