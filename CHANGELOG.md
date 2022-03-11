# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-alpha.0] - 2022-03-11

### Breaking Changes

- Minimum Node version is now 14.19.0
- Several exported types have been improved or renamed
- There is no longer a default export from the library. The main export now includes named exports `Connection`, `Document`, `Schema`, and the various `Error` classes.
- `createConnection` has been changed from a standalone exported function to a static method on the `Connection` class. This is now the only supported mechanism for instiantiating a `Connection`.
- `ConnectionManagerError` has been renamed as `MvisError` and its properties similarly renamed since the official Rocket product is "MVIS"

### Changed

- Migrated library from BitBucket to GitHub
- Update repository URL in `package.json` ([#3](https://github.com/STORIS/mvom/pull/3))
- Update all dependencies to latest version
- Library has been completely converted to TypeScript ([#14](https://github.com/STORIS/mvom/pull/14), [#18](https://github.com/STORIS/mvom/pull/18), [#20](https://github.com/STORIS/mvom/pull/20), [#22](https://github.com/STORIS/mvom/pull/22), and [#23](https://github.com/STORIS/mvom/pull/23))
- Uses STORIS published eslint, prettier, and typescript configurations
- Convert changelog to the Keep-a-Changelog standard

### Added

- Use GitHub actions for CI ([#1](https://github.com/STORIS/mvom/pull/1))
- Use Renovate to keep dependencies up to date ([#2](https://github.com/STORIS/mvom/pull/2))

## [1.0.0] - 2022-02-22

No changes; only publish 1.0.0 stable release

## [1.0.0-rc.1] - 2021-10-19

### Fixed

- Fix projection error on schemaless models

## [1.0.0-rc.0] - 2021-10-18

### Breaking changes

- Node 12 is now minimum version

### Added

- Allow explicit `$and` operator for queries
- Improve Query unit tests
- Allow schematically defined foreign key validations
- Allow projection operators to be passed to queries to limit returned data from data server and transformations
- Allow reading binary files as Base64 encoded

### Changed

- Update dependencies to remove security warnings

## [0.9.4] - 2021-06-30

### Changed

- Update all dependencies
- Format the ISOCalendarDateTime type to have the time component left padded with zeroes

## [0.9.3] - 2021-05-07

### Changed

- Update production dependencies to remedy high vulnerability security issues

## [0.9.2] - 2020-11-19

### Fixed

- Several properties on the `Document` instance were intended to not be enumerable and were not getting configured properly to ensure that. This change ensures that the `transformDocumentToRecord`, `_transformRecordToDocument`, and `validate` properties are not configurable, not enumerable, and not writable. Since `Model` inherits from `Document`, this will affect instances of that class as well.

## [0.9.1] - 2020-05-22

### Fixed

- When a document's property is a schema type of Array or NestedArray, `required` validation will fail when the property is not defined. This is because during validation the `undefined` property gets cast to `null` and then the array gets cast to `[null]` during validation which fails. The issue is that `undefined` and `null` values are not cast to arrays prior to validation in the same way that `DocumentArray`s are. This change casts `null` and `undefined` properties to `[]` and scalars to an array of that scalar during property validation.

## [0.9.0] - 2020-05-18

### Breaking changes

- Eliminate implicit `required` validation of primitive arrays that was occurring if the primitive's schema definition indicated it was `required`. This effectively made it so that arrays must have a length greater than 0 if the contents of the array were required. This caused the `required` flag to effectively serve double-duty -- preventing `null`/`undefined` contents of arrays and enforcing that arrays contained contents.

## [0.8.0] - 2020-04-21

### Added

- Add support to encrypt and decrypt strings and ISO calendar dates. String and ISOCalendarDate type fields can be marked as `encrypted`. The Schema constructor now accepts optional `encrypt` and `decrypt` functions. If a field is marked as `encrypted` these provided functions will be run.

## [0.7.0] - 2020-04-03

### Changed

- Update to fix dependency vulnerabilities
- Expose the `Document` constructor and allow a record to be passed in the constructor without having fetched it from the DB

## [0.6.2] - 2020-03-24

### Fixed

- Fix a deployment issue introduced in 0.6.0. Make sure that all features needed for the `deploy` feature are deployed as part of a bootstrap step
- Add temporary workarounds for several issues identified in UniQuery
  - Using the `returning` clause on a query where a query limit is exceeded causes an abort (proposed to be fixed in UniData 8.2.2)
  - Exceeding the sentence length limit does to set an error condition in `@system.return.code` therefore returning incorrect results instead of an error.

## [0.6.1] - 2020-03-13

### Added

- Allow for regular expression pattern matching for strings and ids. Strings will accept a property named `match` in the schema definition for any string type. Document ids can be matched by providing an `idMatch` property to the Schema constructor options.

### Changed

- Update some vulnerable dependencies

## [0.6.0] - 2020-03-03

### Breaking changes

- Add new setup and teardown features which will run before and after a subroutine feature to setup and teardown the environment. While configurable, the initial implementation creates and clears a named common block called `S$MVOM`, which includes one variable called `S$MVOM.PROCESS` set to `true`. UniBasic programs can check for this variable to determine if they were initiated by `MVIS`. This may be necessary when code not shipped through MVOM is run like in a database trigger or virtual dictionary.

UniBasic programs should include the below to use this new variable:

```UniBasic
COM /S$MVOM/ S$MVOM.PROCESS
```

- Enhance the save action to support clearing all attributes before writing out the record. This fixes an issue with schemaless documents where the record being written has less attributes than what is already on disk. This is automatically set when working with schemaless files.

## [0.5.2] - 2020-02-25

### Added

- Allow for null schemas passed to the model constructor. When schemas are null, no mapping of the record to a document (and vice versa) will occur. Instead, a property named `_raw` will be added to the document which contains an array of the record contents. When saving, this array will overwrite the entire record.

## [0.5.1] - 2019-11-21

### Changed

- Rollback fs-extra version to avoid memory leak

## [0.5.0] - 2019-11-11

### Breaking changes

- Fix simple and document array handling so they can be cleared using an empty array syntax and also update correctly when changing the length
- Change exported error names so they contain an `Error` suffix for clarity

### Changed

- Update dependencies and begin conversion to TypeScript

## [0.4.0] - 2019-07-18

### Breaking changes

- String types with an enumeration of empty string will return empty string instead of null from the database

### Changed

- Improve the Model class in the typescript declaration

## [0.3.5] - 2019-06-03

### Fixed

- Correct static members on Model class in TS declaration file

## [0.3.4] - 2019-05-30

### Added

- Add TypeScript declaration file

## [0.3.3] - 2019-05-16

### Fixed

- Ensure that the `count` property returned from `findAndCount` is numeric

## [0.3.2] - 2019-05-13

### Added

- Add new `findByIds` static model method which finds a list of documents by id.
- Add new `findAndCount` static model method which returns both the documents matching the query as well as the count of all documents matching the query irrespective of skip and limit

## [0.3.1] - 2018-12-21

### Fixed

- Fix an issue where enum validation returns a data validation error on null values on non-required fields

## [0.3.0] - 2018-12-17

### Breaking changes

- Correctly format an attribute that only contains subvalued data. Previously this returned a string with embedded subvalue delimiters. This now returns a nested array.

### Changed

- Improve the performance of the server-side formatDocument routine on large records by switching to REMOVE and udoAppendArrayItem
- Fix an abort from the U2 digest function when reading or overwriting a previously empty record

## [0.2.1] - 2018-10-22

### Added

- The constant values for queries will now be converted from the external schema format to the internal u2 format. This affects the date/time types as well as Booleans.
- Add support for specifying allowed enum values in the schema for string types

## [0.2.0] - 2018-09-18

### Breaking changes

- Connections now accept a timeout parameter which will override the default of no timeout. The default remains to be no timeout.
- The `request` and `response` properties of the `ConnectionManager` error object have now been renamed so they do not appear to be errors that directly came from axios. They are now `connectionManagerRequest` and `connectionManagerResponse` respectively.
- The `Connection` class is no longer exported. Connections should be established via the `createConnection` method which now accepts all parameters that the `Connection` class accepts
- mvom will no longer create a default winston logger if one is not passed to the connection constructor. All consumers who wish to have mvom provide logging should pass in their own logger (such as [winston](https://www.npmjs.com/package/winston)) which provides methods conforming to the npm log levels.

### Changed

- Nearly all dependencies and devDependencies have been updated to the latest versions
- Db server tier errors can now be cast to error class instances. Errors due to record locking will now be cast to `RecordLockedError` and errors due to record version mismatches will be cast to `RecordVersionError`
- Db server errors occuring during save will now enrich the error object with the filename and record id in the error object's `other` property
- All errors thrown from mvom will now contain a source property with a value of `mvom`

## [0.1.0] - 2018-08-10

### Breaking changes

We've graduated from Alpha to Beta! Semver has been updated so breaking vs. non-breaking changes can be more easily identified go forward.

### Fixed

- A bug was discovered where a subdocument array could not reference a multi-part path. That is, the subdocument array had a path in the format of `x.y` indicating the data was located at a particular attribute and value and the array should iterate across the subvalue. In this structure, the properties in the subdocument arrays would end up empty. This has been corrected.

## [0.0.10] - 2018-06-12

### Changed

- An object in the Schema is now only considered to be a "data definition" if it contains both a `type` and a `path` property. If an object doesn't contain both of these properties, it will be treated as a subdocument object instead of a data definition. The upshot of this is that `type` can now be used as a data-describing property in a Schema definition, provided that it does not appear alongside a `path` property in that same definition.

## [0.0.9] - 2018-06-07

### Added

- Connection instances now expose `getDbDate`, `getDbDateTime`, and `getDbTime` functions. These can be used to calculate the date and time values as represented at the database layer since it is likely to differ from the layer running mvom. This will allow consumers to get these values so they can be provided in the data. Note: This information is cached with a tunable time period (default 1 hour) in order to provide low latency feedback but also reasonably handle shifts in the database time (e.g. daylight saving time, server migrations, etc.)

## [0.0.8] - 2018-05-30

### Breaking changes

- Document constructor no longer accepts "record" -- instead it accepts an object of data
- Plain objects can now be used with subdocuments, enabling far easier use of these structures

## [0.0.7] - 2018-05-07

### Breaking changes

- Use array of arrays for sort criteria to preserve sequencing; can no longer be specified as object

## [0.0.6] - 2018-04-19

### Added

- Provide default dictionary of @ID for `_id` property

## [0.0.5] - 2018-04-17

### Breaking changes

- Do not treat missing records as an error condition - instead return null from findById

## [0.0.4] - 2018-04-16

### Breaking changes

- Partially revert changes to default export -- continue to export as named exports as well

## [0.0.3] - 2018-04-16

### Added

- When a query property is equal to an array, automatically convert to $in query
- Change default export from library to include Connection, Errors, and Schema

## [0.0.2] - 2018-04-09

### Added

- Connection is now exported from main module
- `__v` is now an accessible property in model instances
- Connection instances now have a status

### Fixed

- Models cannot be created from connection instances that have not been opened

## [0.0.1] - 2018-03-19

Initial alpha release of this library! Thanks for using it!

[unreleased]: https://github.com/storis/mvom/compare/2.0.0-alpha.0...HEAD
[2.0.0-alpha.0]: https://github.com/storis/mvom/compare/1.0.0...2.0.0-alpha.0
[1.0.0]: https://github.com/storis/mvom/compare/1.0.0-rc.1...1.0.0
[1.0.0-rc.1]: https://github.com/storis/mvom/compare/1.0.0-rc.0...1.0.0-rc.1
[1.0.0-rc.0]: https://github.com/storis/mvom/compare/0.9.4...1.0.0-rc.0
[0.9.4]: https://github.com/storis/mvom/compare/0.9.3...0.9.4
[0.9.3]: https://github.com/storis/mvom/compare/0.9.2...0.9.3
[0.9.2]: https://github.com/storis/mvom/compare/0.9.1...0.9.2
[0.9.1]: https://github.com/storis/mvom/compare/0.9.0...0.9.1
[0.9.0]: https://github.com/storis/mvom/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/storis/mvom/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/storis/mvom/compare/0.6.2...0.7.0
[0.6.2]: https://github.com/storis/mvom/compare/0.6.1...0.6.2
[0.6.1]: https://github.com/storis/mvom/compare/0.6.0...0.6.1
[0.6.0]: https://github.com/storis/mvom/compare/0.5.2...0.6.0
[0.5.2]: https://github.com/storis/mvom/compare/0.5.1...0.5.2
[0.5.1]: https://github.com/storis/mvom/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/storis/mvom/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/storis/mvom/compare/0.3.5...0.4.0
[0.3.5]: https://github.com/storis/mvom/compare/0.3.4...0.3.5
[0.3.4]: https://github.com/storis/mvom/compare/0.3.3...0.3.4
[0.3.3]: https://github.com/storis/mvom/compare/0.3.2...0.3.3
[0.3.2]: https://github.com/storis/mvom/compare/0.3.1...0.3.2
[0.3.1]: https://github.com/storis/mvom/compare/0.3.0...0.3.1
[0.3.0]: https://github.com/storis/mvom/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/storis/mvom/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/storis/mvom/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/storis/mvom/compare/0.0.10...0.1.0
[0.0.10]: https://github.com/storis/mvom/compare/0.0.9...0.0.10
[0.0.9]: https://github.com/storis/mvom/compare/0.0.8...0.0.9
[0.0.8]: https://github.com/storis/mvom/compare/0.0.7...0.0.8
[0.0.7]: https://github.com/storis/mvom/compare/0.0.6...0.0.7
[0.0.6]: https://github.com/storis/mvom/compare/0.0.5...0.0.6
[0.0.5]: https://github.com/storis/mvom/compare/0.0.4...0.0.5
[0.0.4]: https://github.com/storis/mvom/compare/0.0.3...0.0.4
[0.0.3]: https://github.com/storis/mvom/compare/0.0.2...0.0.3
[0.0.2]: https://github.com/storis/mvom/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/storis/mvom/releases/tag/0.0.1
