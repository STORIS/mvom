"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7297],{2504:e=>{e.exports=JSON.parse('{"version":{"pluginId":"default","version":"current","label":"3.0.0","banner":null,"badge":false,"noIndex":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"docsSidebar":[{"type":"category","label":"Introduction","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"What is MVOM?","href":"/mvom/docs/Introduction/what_is_mvom","docId":"Introduction/what_is_mvom","unlisted":false},{"type":"link","label":"Installation","href":"/mvom/docs/Introduction/installation","docId":"Introduction/installation","unlisted":false},{"type":"link","label":"Setup and Configuration","href":"/mvom/docs/Introduction/setup_and_configuration","docId":"Introduction/setup_and_configuration","unlisted":false}]},{"type":"link","label":"Connection","href":"/mvom/docs/connection","docId":"connection","unlisted":false},{"type":"category","label":"Schema","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"Schema Basics","href":"/mvom/docs/Schema/schema_basics","docId":"Schema/schema_basics","unlisted":false},{"type":"category","label":"Scalar Schema Types","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"String","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_string","docId":"Schema/Scalar Schema Types/schema_type_string","unlisted":false},{"type":"link","label":"Boolean","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_boolean","docId":"Schema/Scalar Schema Types/schema_type_boolean","unlisted":false},{"type":"link","label":"Number","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_number","docId":"Schema/Scalar Schema Types/schema_type_number","unlisted":false},{"type":"link","label":"ISOCalendarDate","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_isocalendardate","docId":"Schema/Scalar Schema Types/schema_type_isocalendardate","unlisted":false},{"type":"link","label":"ISOTime","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_isotime","docId":"Schema/Scalar Schema Types/schema_type_isotime","unlisted":false},{"type":"link","label":"ISOCalendarDateTime","href":"/mvom/docs/Schema/Scalar Schema Types/schema_type_isocalendardatetime","docId":"Schema/Scalar Schema Types/schema_type_isocalendardatetime","unlisted":false}]},{"type":"link","label":"Schema Options","href":"/mvom/docs/Schema/schema_options","docId":"Schema/schema_options","unlisted":false},{"type":"link","label":"Scalar Arrays","href":"/mvom/docs/Schema/schema_scalar_arrays","docId":"Schema/schema_scalar_arrays","unlisted":false},{"type":"link","label":"Embedded Objects","href":"/mvom/docs/Schema/schema_embedded_objects","docId":"Schema/schema_embedded_objects","unlisted":false},{"type":"link","label":"Object Arrays","href":"/mvom/docs/Schema/schema_object_arrays","docId":"Schema/schema_object_arrays","unlisted":false},{"type":"link","label":"Encryption","href":"/mvom/docs/Schema/schema_encryption","docId":"Schema/schema_encryption","unlisted":false}]},{"type":"category","label":"Model","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"Model Basics","href":"/mvom/docs/Model/model_basics","docId":"Model/model_basics","unlisted":false},{"type":"link","label":"Creating a Model","href":"/mvom/docs/Model/model_creation","docId":"Model/model_creation","unlisted":false},{"type":"link","label":"Reading a Model By ID","href":"/mvom/docs/Model/model_reading_by_id","docId":"Model/model_reading_by_id","unlisted":false},{"type":"link","label":"Saving a Model","href":"/mvom/docs/Model/model_saving","docId":"Model/model_saving","unlisted":false},{"type":"link","label":"Deleting a Model","href":"/mvom/docs/Model/model_deletion","docId":"Model/model_deletion","unlisted":false},{"type":"category","label":"Querying","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"Query Basics","href":"/mvom/docs/Model/Querying/model_query_basics","docId":"Model/Querying/model_query_basics","unlisted":false},{"type":"link","label":"Query Conditional Operators","href":"/mvom/docs/Model/Querying/model_query_operators","docId":"Model/Querying/model_query_operators","unlisted":false},{"type":"link","label":"Combining Multiple Operators","href":"/mvom/docs/Model/Querying/model_query_multiple_operators","docId":"Model/Querying/model_query_multiple_operators","unlisted":false},{"type":"link","label":"Pagination","href":"/mvom/docs/Model/Querying/model_query_pagination","docId":"Model/Querying/model_query_pagination","unlisted":false},{"type":"link","label":"Sorting","href":"/mvom/docs/Model/Querying/model_query_sorting","docId":"Model/Querying/model_query_sorting","unlisted":false}]},{"type":"category","label":"Advanced Topics","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"The __v Property","href":"/mvom/docs/Model/Advanced Topics/model_version","docId":"Model/Advanced Topics/model_version","unlisted":false},{"type":"link","label":"Projection","href":"/mvom/docs/Model/Advanced Topics/model_projection","docId":"Model/Advanced Topics/model_projection","unlisted":false},{"type":"link","label":"Schemaless Models","href":"/mvom/docs/Model/Advanced Topics/model_schemaless","docId":"Model/Advanced Topics/model_schemaless","unlisted":false},{"type":"link","label":"Reading Encoded Data","href":"/mvom/docs/Model/Advanced Topics/model_reading_encoded","docId":"Model/Advanced Topics/model_reading_encoded","unlisted":false},{"type":"link","label":"Detecting MVOM in Triggers","href":"/mvom/docs/Model/Advanced Topics/model_detecting_mvom","docId":"Model/Advanced Topics/model_detecting_mvom","unlisted":false},{"type":"link","label":"User Defined Options","href":"/mvom/docs/Model/Advanced Topics/model_user_defined_options","docId":"Model/Advanced Topics/model_user_defined_options","unlisted":false},{"type":"link","label":"Request Log Tracing","href":"/mvom/docs/Model/Advanced Topics/model_request_log_tracing","docId":"Model/Advanced Topics/model_request_log_tracing","unlisted":false}]}]},{"type":"link","label":"Document","href":"/mvom/docs/document","docId":"document","unlisted":false}]},"docs":{"connection":{"id":"connection","title":"Connection","description":"The first step to working with MVOM is to establish a connection to the database server via MVIS. Establishing a connection is facilitated via the Connection class which is exported from MVOM as a named export.","sidebar":"docsSidebar"},"document":{"id":"document","title":"Document","description":"The Document class is the superclass of the Model class. Essentially a Document is a Model without any of the database access functionality of the Model class. A Document has a Schema but it does not have a Connection. Most consumers will never need to interact directly with a Document.","sidebar":"docsSidebar"},"Introduction/installation":{"id":"Introduction/installation","title":"Installation","description":"MVOM is available as an npm package. Install using your favorite package manager:","sidebar":"docsSidebar"},"Introduction/setup_and_configuration":{"id":"Introduction/setup_and_configuration","title":"Setup and Configuration","description":"In order to communicate to the MultiValue database, the following are required:","sidebar":"docsSidebar"},"Introduction/what_is_mvom":{"id":"Introduction/what_is_mvom","title":"What is MVOM?","description":"MVOM (MultiValue Object Mapper) is a library which provides the ability to access Multivalue databases (e.g. Unidata, Universe) using applications written for Node.js.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_detecting_mvom":{"id":"Model/Advanced Topics/model_detecting_mvom","title":"Detecting MVOM in Triggers","description":"Generally speaking, MVOM will never interact directly with your MultiValue BASIC code as it is designed to be standalone. However, MVOM is reading and writing records from the MultiValue database the same way any other MultiValue BASIC programs would. Therefore, if a database file has a trigger established for it then database write operations will continue to fire those triggers.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_projection":{"id":"Model/Advanced Topics/model_projection","title":"Projection","description":"Consumers do not always want to return the entire contents of a record. In particular, for large records, returning the entirety of the record can increase the size of data transfer payloads and reduce overall performance if all of the data from a record is not needed. To support this behavior, many read operations allow for specification of a projection property. This projection property allows the consumer to limit the properties returned from the database resulting in reduced data traffic.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_reading_encoded":{"id":"Model/Advanced Topics/model_reading_encoded","title":"Reading Encoded Data","description":"MVOM allows for the reading of data from a DIR-type file as a base-64 encoded string. The static readFileContentsById method of the Model class can be used for this functionality.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_request_log_tracing":{"id":"Model/Advanced Topics/model_request_log_tracing","title":"Request Log Tracing","description":"In complex applications where many different processes interact to handle a request it can be difficult to trace the flow of data in the event of an error. One approach is to collect the logs emitted by the separate processes in a log aggregator such as ElasticSearch, Datadog, or Splunk. A unique request or trace id is passed between processes and any emitted logs contain this id. The id can be used to filter and group the logs.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_schemaless":{"id":"Model/Advanced Topics/model_schemaless","title":"Schemaless Models","description":"On occasion, MultiValue records will be used in a manner that does not lend itself to defining a schema. The flexibility of the MultiValue data structure allows records to take amorphous shapes. For instance, a MultiValue record might be a dynamically sized list of strings with each attribute containing one item from the list. It is not possible to define a Schema for these types of records, but consumers of MVOM might still wish to work with records of that nature. Schemaless models allow for that functionality. To create a Model that does not have a schema, you should provide null for the schema parameter in the call to connection.model.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_user_defined_options":{"id":"Model/Advanced Topics/model_user_defined_options","title":"User Defined Options","description":"Many Model methods have an option property named userDefined available. As noted in the Detecting MVOM in Triggers section, MVOM is standalone but can potentially fire triggers upon writing. The userDefined object allows for passing values through to those trigger subroutines via the /S$MVOM/ named common area.","sidebar":"docsSidebar"},"Model/Advanced Topics/model_version":{"id":"Model/Advanced Topics/model_version","title":"The __v Property","description":"The v property of a Model instance is a special internal value which indicates the \\"version\\" of the data that the Model was instantiated from during database read operations. It is generated by calculating a hash of the record after it was read from disk. The v property exists on all Model instances and is accessible to consumers of the Model.","sidebar":"docsSidebar"},"Model/model_basics":{"id":"Model/model_basics","title":"Model Basics","description":"A Model is a special constructor which is derived from a Connection and a Schema instance. Model constructors are dynamically generated from the connection and schema and are the interface point to the MultiValue database. All of the logic for interacting with data therefore comes from a Model class.","sidebar":"docsSidebar"},"Model/model_creation":{"id":"Model/model_creation","title":"Creating a Model","description":"Model instances are typically created by consumers for the purpose of inserting a new record into the database.","sidebar":"docsSidebar"},"Model/model_deletion":{"id":"Model/model_deletion","title":"Deleting a Model","description":"MVOM allows deleting database records by specifying the iD to the record. The Model class exposes a static method deleteById to support this ability.","sidebar":"docsSidebar"},"Model/model_reading_by_id":{"id":"Model/model_reading_by_id","title":"Reading a Model By ID","description":"MVOM allows reading database records by specifying an ID to the record. The Model class offers two static method findById and findByIds which support this ability.","sidebar":"docsSidebar"},"Model/model_saving":{"id":"Model/model_saving","title":"Saving a Model","description":"An instance of a Model can be saved to the database. This save operation can either be the insertion of a new record into the database or the update to an existing record.","sidebar":"docsSidebar"},"Model/Querying/model_query_basics":{"id":"Model/Querying/model_query_basics","title":"Query Basics","description":"MVOM allows consumers to execute queries against the database via the defined schema associated with a Model instance. Queries are constructed using MVOM\'s query language which are then translated into MultiValue queries. The results of the query are then returned as Model instances. MVOM exposes two static methods for issuing queries: find and findAndCount.","sidebar":"docsSidebar"},"Model/Querying/model_query_multiple_operators":{"id":"Model/Querying/model_query_multiple_operators","title":"Combining Multiple Operators","description":"It is common to require specifying multiple query operators in order to filter results by multiple conditions. MVOM supports the ability to specify multiple operators in a variety of ways.","sidebar":"docsSidebar"},"Model/Querying/model_query_operators":{"id":"Model/Querying/model_query_operators","title":"Query Conditional Operators","description":"MVOM supports a number of query operators to use for filtering the results of a query.","sidebar":"docsSidebar"},"Model/Querying/model_query_pagination":{"id":"Model/Querying/model_query_pagination","title":"Pagination","description":"MVOM allows queries to be specified that limit the number of results returned from a query and to skip a number of results that are returned by a query. This is performed using the limit and skip properties of the query options. These properties can be used independently of one another, but typically they are used together in order to paginate queries.","sidebar":"docsSidebar"},"Model/Querying/model_query_sorting":{"id":"Model/Querying/model_query_sorting","title":"Sorting","description":"Query results can be sorted by using the sort property of the query options. sort accepts an array of a 2-tuple. The first index of the tuple is the property name associated with a dictionary that you wish to sort on and the second index of the tuple is either 1 to indicate ascending sort or -1 to indicate descending sort. Sort criteria will be added in the order in which they appear in the array, so this mechanism can be used in order to prioritize sort behavior.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_boolean":{"id":"Schema/Scalar Schema Types/schema_type_boolean","title":"Boolean","description":"The Boolean schema type allows you to work with boolean values.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_isocalendardate":{"id":"Schema/Scalar Schema Types/schema_type_isocalendardate","title":"ISOCalendarDate","description":"The ISOCalendarDate schema type allow you to work with date values.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_isocalendardatetime":{"id":"Schema/Scalar Schema Types/schema_type_isocalendardatetime","title":"ISOCalendarDateTime","description":"The ISOCalendarDateTime schema type allow you to work with compound date-time values.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_isotime":{"id":"Schema/Scalar Schema Types/schema_type_isotime","title":"ISOTime","description":"The ISOTime schema type allow you to work with time values.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_number":{"id":"Schema/Scalar Schema Types/schema_type_number","title":"Number","description":"The number schema type allows you to work with numeric values.","sidebar":"docsSidebar"},"Schema/Scalar Schema Types/schema_type_string":{"id":"Schema/Scalar Schema Types/schema_type_string","title":"String","description":"The string schema type is the simplest of the schema types supported by MVOM.","sidebar":"docsSidebar"},"Schema/schema_basics":{"id":"Schema/schema_basics","title":"Schema Basics","description":"The Schema class allows you to define your data definition for your MultiValue files. This definition is used to transform MultiValue data between the database and a JavaScript object. Additionally, it allows you to define data validation requirements to aid in ensuring data validity upon writing to the database.","sidebar":"docsSidebar"},"Schema/schema_embedded_objects":{"id":"Schema/schema_embedded_objects","title":"Embedded Objects","description":"MVOM will work with the defined schema structure to produce an object that follows the structure of the schema. That is, a property of a schema definition can also be a schema definition. In this way, an object can be embedded in the parent object. This allows for relating data that might be semantically understood more easily if it was held in a contained object rather than being properties of the parent object.","sidebar":"docsSidebar"},"Schema/schema_encryption":{"id":"Schema/schema_encryption","title":"Encryption","description":"MVOM supports optional transparent data encryption functionality within the schema definitions. MVOM does not provide any native support for encryption but does allow consumers to optionally specify encryption and decryption functions which must be implemented by the user. Encrypt functions are run prior to save operations and decrypt functions are run subsequent to read operations, resulting in the encryption and decryption processes being transparent to consumers.","sidebar":"docsSidebar"},"Schema/schema_object_arrays":{"id":"Schema/schema_object_arrays","title":"Object Arrays","description":"MVOM allows schema definitions which produce arrays of objects. In MultiValue terminology, these structures are generally referred to as \\"associations\\". They are generally structured as parallel associative arrays where each array index from an attribute is related to the same index in one or more other attributes.","sidebar":"docsSidebar"},"Schema/schema_options":{"id":"Schema/schema_options","title":"Schema Options","description":"Several options can be passed to the schema constructor. As defined in Schema Basics, the syntax of the Schema constructor is:","sidebar":"docsSidebar"},"Schema/schema_scalar_arrays":{"id":"Schema/schema_scalar_arrays","title":"Scalar Arrays","description":"MVOM allows schema definitions that define arrays of any scalar schema types. In the MultiValue database, these would typically be stored as a multivalued or multi-subvalued attribute.","sidebar":"docsSidebar"}}}}')}}]);