# CHANGELOG.md
## 0.1.0
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
### Breaking change
###### _2018-05-30
- Document constructor no longer accepts "record" -- instead it accepts an object of data @shawnmcknight
- Plain objects can now be used with subdocuments, enabling far easier use of thse structures @shawnmcknight

## 0.0.7
### Breaking change
###### _2018-05-07
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
