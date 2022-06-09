"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[17],{3905:function(e,t,n){n.d(t,{Zo:function(){return c},kt:function(){return h}});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),d=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=d(e.components);return a.createElement(p.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=d(n),h=i,u=m["".concat(p,".").concat(h)]||m[h]||s[h]||r;return n?a.createElement(u,o(o({ref:t},c),{},{components:n})):a.createElement(u,o({ref:t},c))}));function h(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=m;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var d=2;d<r;d++)o[d]=n[d];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3594:function(e,t,n){n.r(t),n.d(t,{assets:function(){return c},contentTitle:function(){return p},default:function(){return h},frontMatter:function(){return l},metadata:function(){return d},toc:function(){return s}});var a=n(7462),i=n(3366),r=(n(7294),n(3905)),o=["components"],l={id:"schema_options",title:"Schema Options"},p="Schema Options",d={unversionedId:"Schema/schema_options",id:"Schema/schema_options",title:"Schema Options",description:"Several options can be passed to the schema constructor. As defined in Schema Basics, the syntax of the Schema constructor is:",source:"@site/docs/03 - Schema/03 - Schema Options.md",sourceDirName:"03 - Schema",slug:"/Schema/schema_options",permalink:"/mvom/docs/Schema/schema_options",draft:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/03 - Schema/03 - Schema Options.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{id:"schema_options",title:"Schema Options"},sidebar:"docsSidebar",previous:{title:"ISOCalendarDateTime",permalink:"/mvom/docs/Schema/Scalar Schema Types/schema_type_isocalendardatetime"},next:{title:"Scalar Arrays",permalink:"/mvom/docs/Schema/schema_scalar_arrays"}},c={},s=[{value:"Options Object Properties",id:"options-object-properties",level:2},{value:"Dictionaries object",id:"dictionaries-object",level:3},{value:"Example",id:"example",level:4},{value:"Defining type information for dictionaries",id:"defining-type-information-for-dictionaries",level:4},{value:"Example",id:"example-1",level:5},{value:"Validating ID pattern matching",id:"validating-id-pattern-matching",level:3},{value:"Validating ID foreign key",id:"validating-id-foreign-key",level:3},{value:"Encryption",id:"encryption",level:3}],m={toc:s};function h(e){var t=e.components,n=(0,i.Z)(e,o);return(0,r.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"schema-options"},"Schema Options"),(0,r.kt)("p",null,"Several options can be passed to the schema constructor. As defined in ",(0,r.kt)("a",{parentName:"p",href:"./schema_basics"},"Schema Basics"),", the syntax of the Schema constructor is:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"constructor(definition: SchemaDefinition, options?: SchemaConstructorOptions): Schema\n")),(0,r.kt)("p",null,"The second parameter is the options object which contains a number of properties which will affect the behavior of the defined Schema."),(0,r.kt)("h2",{id:"options-object-properties"},"Options Object Properties"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Property"),(0,r.kt)("th",{parentName:"tr",align:null},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"dictionaries")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("a",{parentName:"td",href:"#dictionaries-object"},"object")),(0,r.kt)("td",{parentName:"tr",align:null},"Object defining additional dictionaries not defined in the schema for use in queries")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"idMatch")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"RegExp")),(0,r.kt)("td",{parentName:"tr",align:null},"If specified, the ",(0,r.kt)("inlineCode",{parentName:"td"},"_id")," of the object will be matched against this regular expression")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"idForeignKey")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("a",{parentName:"td",href:"#validating-id-foreign-key"},"object")),(0,r.kt)("td",{parentName:"tr",align:null},"If specified, value will be validated for foreign key constraints.",(0,r.kt)("br",null)," See link for details on format.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"encrypt")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Function")),(0,r.kt)("td",{parentName:"tr",align:null},"If specified, an encryption function to use with encrypted schema properties")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"decrypt")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"Function")),(0,r.kt)("td",{parentName:"tr",align:null},"If specified, a decryption function to use with encrypted schema properties")))),(0,r.kt)("h3",{id:"dictionaries-object"},"Dictionaries object"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"dictionaries"),' property in the schema options allows you to specify additional dictionaries which can be used in queries. These would be for dictionaries that are not added to a schema definition and would typically be used for virtual or "I-Type" dictionaries.'),(0,r.kt)("p",null,"The object is generally used as key-value pairings that map a property name to the dictionary ID that will correspond with that name. This is similar to how a schema definition will have a property name and a dictionary name defined. Once defined, the properties can then be used for querying purposes just like any schema definition property with a defined dictionary."),(0,r.kt)("h4",{id:"example"},"Example"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const dictionaries = {\n  customerId: 'CUST_ID',\n  openBalance: 'OPEN_BAL',\n};\n\nconst schema = new Schema({...}, { dictionaries });\n")),(0,r.kt)("h4",{id:"defining-type-information-for-dictionaries"},"Defining type information for dictionaries"),(0,r.kt)("p",null,"Although most data types can be used without any need to convert formatting (e.g. string or numeric types), some dictionary types have different internal and external representations such as date and boolean. For example, a boolean represented in the MultiValue database will be stored as ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"0")," while in JavaScript it would be represented by ",(0,r.kt)("inlineCode",{parentName:"p"},"true")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"false"),". For dictionaries added via a schema definition, this conversion is performed implicitly since type information must be included in a schema definition. That is, a query issued using a schema defined ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," will automatically be converted from ",(0,r.kt)("inlineCode",{parentName:"p"},"true")," to ",(0,r.kt)("inlineCode",{parentName:"p"},"1")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"false")," to ",(0,r.kt)("inlineCode",{parentName:"p"},"0"),"."),(0,r.kt)("p",null,"However, using the simple key-value pairing convention indicated above, there is no mechanism to ascertain data types for the dictionaries. Therefore, an alternate format can be used where the value for each key is instead an object which allows for specification of a data type as well as additional meta information to allow for proper type casting."),(0,r.kt)("p",null,"Although any scalar schema type can be defined in this manner (which can be helpful for documentation purposes), it is generally only necessary for ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"ISOCalendarDate"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"ISOTime"),", and ",(0,r.kt)("inlineCode",{parentName:"p"},"ISOCalendarDateTime")," data types to use this convention. ",(0,r.kt)("inlineCode",{parentName:"p"},"string")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"number")," do not require this as there is no conversion needed for the former and the query engine will properly handle the latter automatically."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Property"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Type"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"type")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("inlineCode",{parentName:"td"},'"string"'),(0,r.kt)("br",null),(0,r.kt)("inlineCode",{parentName:"td"},'"number"'),(0,r.kt)("br",null),(0,r.kt)("inlineCode",{parentName:"td"},'"boolean"'),(0,r.kt)("br",null),(0,r.kt)("inlineCode",{parentName:"td"},'"ISOCalendarDate"'),(0,r.kt)("br",null),(0,r.kt)("inlineCode",{parentName:"td"},'"ISOTime"'),(0,r.kt)("br",null),(0,r.kt)("inlineCode",{parentName:"td"},'"ISOCalendarDateTime"')),(0,r.kt)("td",{parentName:"tr",align:null},"The data type of the value")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"dictionary")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:null},"The name of the dictionary to associate with the property name")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"dbFormat")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("inlineCode",{parentName:"td"},'"s"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"ms"')),(0,r.kt)("td",{parentName:"tr",align:null},"Used only with ",(0,r.kt)("inlineCode",{parentName:"td"},"ISOTime")," and ",(0,r.kt)("inlineCode",{parentName:"td"},"ISOCalendarDateTime")," types to indicate the format of the time value.",(0,r.kt)("br",null),"See the docs on ",(0,r.kt)("a",{parentName:"td",href:"./Scalar%20Schema%20Types/schema_type_isotime"},"ISOTime")," and ",(0,r.kt)("a",{parentName:"td",href:"./Scalar%20Schema%20Types/schema_type_isocalendardatetime"},"ISOCalendarDateTime")," for more information.")))),(0,r.kt)("h5",{id:"example-1"},"Example"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const dictionaries = {\n  customerId: { type: 'string', dictionary: 'CUST_ID' },\n  openBalance: { type: 'number', dictionary: 'OPEN_BAL' },\n  isActive: { type: 'boolean', dictionary: 'ACTIVE' },\n  createDate: { type: 'ISOCalendarDate', dictionary: 'CREATE_DATE' },\n  lastActivity: { type: 'ISOCalendarDateTime', dictionary: 'LAST_ACTIVITY', dbFormat: 'ms' },\n};\n\nconst schema = new Schema({...}, { dictionaries });\n")),(0,r.kt)("h3",{id:"validating-id-pattern-matching"},"Validating ID pattern matching"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"idMatch")," property allows you to specify a regular expression which will validate the ",(0,r.kt)("inlineCode",{parentName:"p"},"_id")," value of an object to determine if there is a match of the regular expression. If the value of ",(0,r.kt)("inlineCode",{parentName:"p"},"_id")," property does not match the regular expression an error will be thrown when saving."),(0,r.kt)("p",null,"Related: ",(0,r.kt)("a",{parentName:"p",href:"./Scalar%20Schema%20Types/schema_type_string#validating-pattern-matching%3E"},"Validating pattern matching in strings")),(0,r.kt)("h3",{id:"validating-id-foreign-key"},"Validating ID foreign key"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"idForeignKey")," property allows you to specify a foreign key definition for the ",(0,r.kt)("inlineCode",{parentName:"p"},"_id")," property. See the ",(0,r.kt)("a",{parentName:"p",href:"./Scalar%20Schema%20Types/schema_type_string#validating-foreign-keys"},"validating foreign keys")," section of the string schema type documentation for more details."),(0,r.kt)("h3",{id:"encryption"},"Encryption"),(0,r.kt)("p",null,"See ",(0,r.kt)("a",{parentName:"p",href:"./schema_encryption"},"encryption")," for more information."))}h.isMDXComponent=!0}}]);