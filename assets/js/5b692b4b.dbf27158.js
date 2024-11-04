"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4471],{2012:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>d,contentTitle:()=>l,default:()=>h,frontMatter:()=>i,metadata:()=>r,toc:()=>o});const r=JSON.parse('{"id":"Schema/schema_scalar_arrays","title":"Scalar Arrays","description":"MVOM allows schema definitions that define arrays of any scalar schema types. In the MultiValue database, these would typically be stored as a multivalued or multi-subvalued attribute.","source":"@site/docs/03 - Schema/04 - Scalar Arrays.md","sourceDirName":"03 - Schema","slug":"/Schema/schema_scalar_arrays","permalink":"/mvom/docs/Schema/schema_scalar_arrays","draft":false,"unlisted":false,"editUrl":"https://github.com/STORIS/mvom/tree/main/website/docs/03 - Schema/04 - Scalar Arrays.md","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"id":"schema_scalar_arrays","title":"Scalar Arrays"},"sidebar":"docsSidebar","previous":{"title":"Schema Options","permalink":"/mvom/docs/Schema/schema_options"},"next":{"title":"Embedded Objects","permalink":"/mvom/docs/Schema/schema_embedded_objects"}}');var n=t(4848),s=t(8453);const i={id:"schema_scalar_arrays",title:"Scalar Arrays"},l="Scalar Arrays",d={},o=[{value:"Arrays from Multivalued Attributes",id:"arrays-from-multivalued-attributes",level:2},{value:"Formatting",id:"formatting",level:3},{value:"Example",id:"example",level:3},{value:"Arrays from Multi-Subvalued Attributes",id:"arrays-from-multi-subvalued-attributes",level:2},{value:"Formatting",id:"formatting-1",level:3},{value:"Example",id:"example-1",level:3},{value:"Arrays from Multi-Subvalued Values",id:"arrays-from-multi-subvalued-values",level:2},{value:"Formatting",id:"formatting-2",level:3},{value:"Example",id:"example-2",level:3}];function c(e){const a={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(a.header,{children:(0,n.jsx)(a.h1,{id:"scalar-arrays",children:"Scalar Arrays"})}),"\n",(0,n.jsx)(a.p,{children:"MVOM allows schema definitions that define arrays of any scalar schema types. In the MultiValue database, these would typically be stored as a multivalued or multi-subvalued attribute."}),"\n",(0,n.jsx)(a.h2,{id:"arrays-from-multivalued-attributes",children:"Arrays from Multivalued Attributes"}),"\n",(0,n.jsxs)(a.p,{children:["To create a schema definition for a multivalued attribute, you simply wrap the schema type definition in ",(0,n.jsx)(a.code,{children:"[]"})," to denote it as an array."]}),"\n",(0,n.jsx)(a.h3,{id:"formatting",children:"Formatting"}),"\n",(0,n.jsxs)(a.p,{children:["A scalar array type will honor all the transformation and validation rules of the schema type that defines the array's contents. For instance, a schema type definition for an array of strings would format as follows (",(0,n.jsx)(a.code,{children:"{vm}"})," denotes value mark delimiter):"]}),"\n",(0,n.jsxs)(a.table,{children:[(0,n.jsx)(a.thead,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.th,{children:"Database Value"}),(0,n.jsx)(a.th,{children:"JavaScript Value"})]})}),(0,n.jsx)(a.tbody,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:"foo{vm}bar{vm}baz"})}),(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:'["foo", "bar", "baz"]'})})]})})]}),"\n",(0,n.jsx)(a.h3,{id:"example",children:"Example"}),"\n",(0,n.jsx)(a.pre,{children:(0,n.jsx)(a.code,{className:"language-ts",children:"const schemaDefinition = {\n  stringArrayProperty: [\n    {\n      type: 'string',\n      path: 1,\n      dictionary: 'STRING_ARRAY_DICT',\n      required: true,\n    },\n  ],\n};\n\nconst schema = new Schema(schemaDefinition);\n"})}),"\n",(0,n.jsx)(a.h2,{id:"arrays-from-multi-subvalued-attributes",children:"Arrays from Multi-Subvalued Attributes"}),"\n",(0,n.jsxs)(a.p,{children:["To create a schema definition for a multi-subvalued attribute, you simply wrap the schema type definition in ",(0,n.jsx)(a.code,{children:"[[]]"})," to denote it as a multi dimensional array."]}),"\n",(0,n.jsx)(a.h3,{id:"formatting-1",children:"Formatting"}),"\n",(0,n.jsxs)(a.p,{children:["A scalar multi-dimensional array type will honor all the transformation and validation rules of the schema type that defines the array's contents. For instance, a schema type definition for a multi-dimensional array of strings would format as follows (",(0,n.jsx)(a.code,{children:"{vm}"})," denotes value mark delimiter and ",(0,n.jsx)(a.code,{children:"{svm}"})," denotes subvalue mark delimiter):"]}),"\n",(0,n.jsxs)(a.table,{children:[(0,n.jsx)(a.thead,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.th,{children:"Database Value"}),(0,n.jsx)(a.th,{children:"JavaScript Value"})]})}),(0,n.jsx)(a.tbody,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:"foo{svm}bar{vm}baz{svm}qux"})}),(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:'[["foo", "bar"], ["baz", "qux]]'})})]})})]}),"\n",(0,n.jsx)(a.h3,{id:"example-1",children:"Example"}),"\n",(0,n.jsx)(a.pre,{children:(0,n.jsx)(a.code,{className:"language-ts",children:"const schemaDefinition = {\n  stringMultiDimensionalArrayProperty: [\n    [\n      {\n        type: 'string',\n        path: 1,\n        dictionary: 'STRING_MD_ARRAY_DICT',\n        required: true,\n      },\n    ],\n  ],\n};\n\nconst schema = new Schema(schemaDefinition);\n"})}),"\n",(0,n.jsx)(a.h2,{id:"arrays-from-multi-subvalued-values",children:"Arrays from Multi-Subvalued Values"}),"\n",(0,n.jsx)(a.p,{children:"Occasionally, attributes will contain values that each denote a different data type or property. In these scenarios, its also possible that one of the values will contain a subvalue delimited list of items. MVOM will handle this as well."}),"\n",(0,n.jsx)(a.h3,{id:"formatting-2",children:"Formatting"}),"\n",(0,n.jsxs)(a.p,{children:[(0,n.jsx)(a.code,{children:"{vm}"})," denotes value mark delimiter and ",(0,n.jsx)(a.code,{children:"{svm}"})," denotes subvalue mark delimiter:"]}),"\n",(0,n.jsxs)(a.table,{children:[(0,n.jsx)(a.thead,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.th,{children:"Database Value"}),(0,n.jsx)(a.th,{children:"JavaScript Value"})]})}),(0,n.jsx)(a.tbody,{children:(0,n.jsxs)(a.tr,{children:[(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:"foo{svm}bar{vm}some other data"})}),(0,n.jsx)(a.td,{children:(0,n.jsx)(a.code,{children:'["foo", "bar"]'})})]})})]}),"\n",(0,n.jsx)(a.h3,{id:"example-2",children:"Example"}),"\n",(0,n.jsx)(a.pre,{children:(0,n.jsx)(a.code,{className:"language-ts",children:"const schemaDefinition = {\n  stringArrayFromValueProperty: [\n    {\n      type: 'string',\n      path: '1.1',\n      dictionary: 'STRING_VAL_ARRAY_DICT',\n      required: true,\n    },\n  ],\n  otherDataProperty: {\n    type: 'string',\n    path: '1.2',\n    dictionary: 'OTHER_DATA_DICT',\n    required: true,\n  },\n};\n\nconst schema = new Schema(schemaDefinition);\n"})})]})}function h(e={}){const{wrapper:a}={...(0,s.R)(),...e.components};return a?(0,n.jsx)(a,{...e,children:(0,n.jsx)(c,{...e})}):c(e)}},8453:(e,a,t)=>{t.d(a,{R:()=>i,x:()=>l});var r=t(6540);const n={},s=r.createContext(n);function i(e){const a=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(a):{...a,...e}}),[a,e])}function l(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:i(e.components),r.createElement(s.Provider,{value:a},e.children)}}}]);