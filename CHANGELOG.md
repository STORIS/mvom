# CHANGELOG.md

## 0.9.4
###### _2021_06_30_
- Update all dependencies. @shawnmcknight
- Format the ISOCalendarDateTime type to have the time component left padded with zeroes.

## 0.9.3
###### _2021_05_07_
- Update production dependencies to remedy high vulnerability security issues. @shawnmcknight

## 0.9.2
###### _2020_11_19_
- Several properties on the `Document` instance were intended to not be enumerable and were not getting configured properly to ensure that.  This change ensures that the `transformDocumentToRecord`, `_transformRecordToDocument`, and `validate` properties are not configurable, not enumerable, and not writable.  Since `Model` inherits from `Document`, this will affect instances of that class as well. @shawnmcknight

## 0.9.1
###### _2020-05-22_
- When a document's property is a schema type of Array or NestedArray, `required` validation will fail when the property is not defined.  This is because during validation the `undefined` property gets cast to `null` and then the array gets cast to `[null]` during validation which fails.  The issue is that `undefined` and `null` values are not cast to arrays prior to validation in the same way that DocumentArray's are.  This change casts `null` and `undefined` properties to `[]` and scalars to an array of that scalar during property validation. @shawnmcknight

## 0.9.0
### Breaking changes
###### _2020-05-18_
- Eliminate implicit `required` validation of primitive arrays that was occurring if the primitive's schema definition indicated it was `required`.  This effectively made it so that arrays must have a length greater than 0 if the contents of the array were required.  This caused the `required` flag to effectively serve double-duty -- preventing `null`/`undefined` contents of arrays and enforcing that arrays contained contents. @shawnmcknight

## 0.8.0
###### _2020-04-21_
- Add support to encrypt and decrypt strings and ISO calendar dates. String and ISOCalendarDate type fields can be marked as `encrypted`. The Schema constructor now accepts optional `encrypt` and `decrypt` functions. If a field is marked as `encrypted` these provided functions will be run. @kthompson23 

## 0.7.0
### Breaking changes
###### _2020-04-03_
- Update to fix dependency vulnerabilities @shawnmcknight
- Expose the `Document` constructor and allow a record to be passed in the constructor without having fetched it from the DB @reedmattos

## 0.6.2
###### _2020-03-24_
- Fix a deployment issue introduced in 0.6.0. Make sure that all features needed for the `deploy` feature are deployed as part of a bootstrap step @kthompson23
- Add temporary workarounds for several issues identified in UniQuery @kthompson23
  - Using the `returning` clause on a query where a query limit is exceeded causes an abort (proposed to be fixed in UniData 8.2.2)
  - Exceeding the sentence length limit does to set an error condition in `@system.return.code` therefore returning incorrect results instead of an error.

## 0.6.1
###### _2020-03-13_
- Allow for regular expression pattern matching for strings and ids.  Strings will accept a property named `match` in the schema definition for any string type.  Document ids can be matched by providing an `idMatch` property to the Schema constructor options. @reedmattos
- Update some vulnerable dependencies @shawnmcknight

## 0.6.0
### Breaking changes
###### _2020-03-03_
- Add new setup and teardown features which will run before and after a subroutine feature to setup and teardown the environment. While configurable, the initial implementation creates and clears a named common block called `S$MVOM`, which includes one variable called `S$MVOM.PROCESS` set to `true`. UniBasic programs can check for this variable to determine if they were initiated by `MVIS`. This may be necessary when code not shipped through MVOM is run like in a database trigger or virtual dictionary. @kthompson23

UniBasic programs should include the below to use this new variable:

```UniBasic
COM /S$MVOM/ S$MVOM.PROCESS
```

- Enhance the save action to support clearing all attributes before writing out the record. This fixes an issue with schema less documents where the record being written has less attributes than what is already on disk. This is automatically set when working with schema less files. @reedmattos 

## 0.5.2
###### _2020-02-25_
- Allow for null schemas passed to the model constructor.  When schemas are null, no mapping of the record to a document (and vice versa) will occur.  Instead, a property named `_raw` will be added to the document which contains an array of the record contents.  When saving, this array will overwrite the entire record. @reedmattos

## 0.5.1
###### _2019-11-21_
- Rollback fs-extra version to avoid memory leak @kthompson23

## 0.5.0
### Breaking changes
###### _2019-11-11_
- Fix simple and document array handling so they can be cleared using an empty array syntax and also update correctly when changing the length. @kthompson23
- Change exported error names so they contain an `Error` suffix for clarity. @shawnmcknight
- Update dependencies and begin conversion to TypeScript. @shawnmcknight

## 0.4.0
### Breaking changes
###### _2019-07-18_
- String types with an enumeration of empty string will return empty string instead of null from the database. @shawnmcknight
- Improve the Model class in the typescript declaration. @shawnmcknight

## 0.3.5
###### _2019-06-03_
- Correct static members on Model class in TS declaration file. @abair91

## 0.3.4
###### _2019-05-30_
- Add TypeScript declaration file. @abair91

## 0.3.3
###### _2019-05-16_
- Ensure that the `count` property returned from `findAndCount` is numeric. @shawnmcknight

## 0.3.2
###### _2019-05-13_
- Add new `findByIds` static model method which finds a list of documents by id. @ReedMattos
- Add new `findAndCount` static model method which returns both the documents matching the query as well as the count of
  all documents matching the query irrespective of skip and limit. @ReedMattos

## 0.3.1
###### _2018-12-21_
- Fix an issue where enum validation returns a data validation error on null values on non-required fields. @kthompson23

## 0.3.0
### Breaking changes
###### _2018-12-17_
- Improve the performance of the server-side formatDocument routine on large records by switching to REMOVE and udoAppendArrayItem @kthompson23
- Fix an abort from the U2 digest function when reading or overwriting a previously empty record. @kthompson23
- Correctly format an attribute that only contains subvalued data. Previously this returned a string with embedded subvalue delimiters. This now returns a nested array. @kthompson23

## 0.2.1
###### _2018-10-22_
- The constant values for queries will now be converted from the external schema format to the internal u2 format.
This affects the date/time types as well as Booleans. @shawnmcknight
- Add support for specifying allowed enum values in the schema for string types. @shawnmcknight

## 0.2.0
### Breaking changes
###### _2018-09-18_
- Nearly all dependencies and devDependencies have been updated to the latest versions. @shawnmcknight
- Connections now accept a timeout parameter which will override the default of no timeout.  The default remains to be
no timeout. @shawnmcknight
- The `request` and `response` properties of the `ConnectionManager` error object have now been renamed so they do not appear
to be errors that directly came from axios.  They are now `connectionManagerRequest` and `connectionManagerResponse`
respectively. @shawnmcknight
- The `Connection` class is no longer exported.  Connections should be established via the `createConnection` method which
now accepts all parameters that the `Connection` class accepts. @shawnmcknight
- mvom will no longer create a default winston logger if one is not passed to the connection constructor.  All consumers who wish
to have mvom provide logging should pass in their own logger (such as [winston](https://www.npmjs.com/package/winston))
which provides methods conforming to the npm log levels. @shawnmcknight
- Db server tier errors can now be cast to error class instances.  Errors due to record locking will
now be cast to `RecordLockedError` and errors due to record version mismatches will be cast to `RecordVersionError` @shawnmcknight
- Db server errors occuring during save will now enrich the error object with the filename and record id in the error
object's `other` property. @shawnmcknight
- All errors thrown from mvom will now contain a source property with a value of `mvom`. @shawnmcknight

## 0.1.0
### Breaking changes
###### _2018-08-10_
We've graduated from Alpha to Beta!  Semver has been updated so breaking vs. non-breaking changes
can be more easily identified go forward.
- A bug was discovered where a subdocument array could not reference a multi-part path.  That is,
  the subdocument array had a path in the format of `x.y` indicating the data was located at a
  particular attribute and value and the array should iterate across the subvalue.  In this structure,
  the properties in the subdocument arrays would end up empty.  This has been corrected. @shawnmcknight

## 0.0.10
###### _2018-06-12_
- An object in the Schema is now only considered to be a "data definition" if it contains both
  a `type` and a `path` property.  If an object doesn't contain both of these properties, it will
  be treated as a subdocument object instead of a data definition.  The upshot of this is that
  `type` can now be used as a data-describing property in a Schema definition, provided that it does
  not appear alongside a `path` property in that same definition. @shawnmcknight

## 0.0.9
###### _2018-06-07_
- Connection instances now expose `getDbDate`, `getDbDateTime`, and `getDbTime` functions.
  These can be used to calculate the date and time values as represented at the
  database layer since it is likely to differ from the layer running mvom.  This
  will allow consumers to get these values so they can be provided in the data.
  Note: This information is cached with a tunable time period (default 1 hour) in order
  to provide low latency feedback but also reasonably handle shifts in the database time
  (e.g. daylight saving time, server migrations, etc.) @shawnmcknight

## 0.0.8
### Breaking changes
###### _2018-05-30_
- Document constructor no longer accepts "record" -- instead it accepts an object of data @shawnmcknight
- Plain objects can now be used with subdocuments, enabling far easier use of thse structures @shawnmcknight

## 0.0.7
### Breaking changes
###### _2018-05-07_
- Use array of arrays for sort criteria to preserve sequencing; can no longer be specified as object @kthompson23

## 0.0.6
###### _2018-04-19_
- Provide default dictionary of @ID for _id property @kthompson23

## 0.0.5
###### _2018-04-17_
- Do not treat missing records as an error condition - instead return null from findById @shawnmcknight

## 0.0.4
###### _2018-04-16_
- Partially revert changes to default export -- continue to export as named exports as well @shawnmcknight

## 0.0.3
###### _2018-04-16_
- When a query property is equal to an array, automatically convert to $in query @shawnmcknight
- Change default export from library to include Connection, Errors, and Schema @shawnmcknight

## 0.0.2
###### _2018-04-09_
- Miscellaneous improvements @shawnmcknight
  - Connection is now exported from main module
  - __v is now an accessible property in model instances
  - Connection instances now have a status
  - Models cannot be created from connection instances that have not been opened

## 0.0.1
###### _2018-03-19_
- Initial alpha release of this library!  Thanks for using it! @shawnmcknight
