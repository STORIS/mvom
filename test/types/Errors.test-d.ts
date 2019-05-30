import { expectType } from 'tsd';
import { Errors, GenericObject } from "../../src/";

expectType<object>(Errors);

// ConnectionManager
const connectionError: Errors.ConnectionManager = new Errors.ConnectionManager({connectionManagerRequest: {test: 'baz'}, test: 'foo', bar: 2});
expectType<GenericObject>(connectionError.connectionManagerRequest);
expectType<GenericObject>(connectionError.connectionManagerResponse);
expectType<'ConnectionManagerError'>(connectionError.name);
expectType<string>(connectionError.message);
expectType<'mvom'>(connectionError.source);
expectType<GenericObject>(connectionError.other);

// DataValidation
const dataValidationError: Errors.DataValidation = new Errors.DataValidation({test: 'foo', bar: 2});
expectType<GenericObject>(dataValidationError.validationErrors);
expectType<'DataValidationError'>(dataValidationError.name);
expectType<string>(dataValidationError.message);
expectType<'mvom'>(dataValidationError.source);
expectType<GenericObject>(dataValidationError.other);

// DbServer
const dbServerError: Errors.DbServer = new Errors.DbServer({test: 'foo', bar: 2});
expectType<'DbServerError'>(dbServerError.name);
expectType<string>(dbServerError.message);
expectType<'mvom'>(dbServerError.source);
expectType<GenericObject>(dbServerError.other);

// DisallowDirect
const disallowDirectError: Errors.DisallowDirect = new Errors.DisallowDirect({test: 'foo', bar: 2});
expectType<string>(disallowDirectError.className);
expectType<'DisallowDirectError'>(disallowDirectError.name);
expectType<string>(disallowDirectError.message);
expectType<'mvom'>(dbServerError.source);
expectType<GenericObject>(disallowDirectError.other);

// InvalidParameter
const invalidParameterError: Errors.InvalidParameter = new Errors.InvalidParameter({test: 'foo', bar: 2});
expectType<string>(invalidParameterError.parameterName);
expectType<'InvalidParameterError'>(invalidParameterError.name);
expectType<string>(invalidParameterError.message);
expectType<'mvom'>(invalidParameterError.source);
expectType<GenericObject>(invalidParameterError.other);

// InvalidServerFeatures
const invalidServerFeaturesError: Errors.InvalidServerFeatures = new Errors.InvalidServerFeatures({test: 'foo', bar: 2});
expectType<string[]>(invalidServerFeaturesError.invalidFeatures);
expectType<'InvalidServerFeaturesError'>(invalidServerFeaturesError.name);
expectType<string>(invalidServerFeaturesError.message);
expectType<'mvom'>(invalidServerFeaturesError.source);
expectType<GenericObject>(invalidServerFeaturesError.other);

// NotImplemented
const notImplementedError: Errors.NotImplemented = new Errors.NotImplemented({test: 'foo', bar: 2});
expectType<string>(notImplementedError.methodName);
expectType<string>(notImplementedError.className);
expectType<'NotImplementedError'>(notImplementedError.name);
expectType<string>(notImplementedError.message);
expectType<'mvom'>(notImplementedError.source);
expectType<GenericObject>(notImplementedError.other);

// RecordLocked
const recordLockedError: Errors.RecordLocked = new Errors.RecordLocked({test: 'foo', bar: 2});
expectType<'RecordLockedError'>(recordLockedError.name);
expectType<string>(recordLockedError.message);
expectType<'mvom'>(recordLockedError.source);
expectType<GenericObject>(recordLockedError.other);

// RecordVersion
const recordVersionError: Errors.RecordVersion = new Errors.RecordVersion({test: 'foo', bar: 2});
expectType<'RecordVersionError'>(recordVersionError.name);
expectType<string>(recordVersionError.message);
expectType<'mvom'>(recordVersionError.source);
expectType<GenericObject>(recordVersionError.other);

// TransformData
const transformDataError: Errors.TransformData = new Errors.TransformData({test: 'foo', bar: 2});
expectType<string>(transformDataError.transformClass);
expectType<any>(transformDataError.transformValue);
expectType<'TransformDataError'>(transformDataError.name);
expectType<string>(transformDataError.message);
expectType<'mvom'>(transformDataError.source);
expectType<GenericObject>(transformDataError.other);
