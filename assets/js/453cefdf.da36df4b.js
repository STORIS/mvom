"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6979],{7193:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>r,default:()=>m,frontMatter:()=>o,metadata:()=>a,toc:()=>d});const a=JSON.parse('{"id":"Schema/schema_embedded_objects","title":"Embedded Objects","description":"MVOM will work with the defined schema structure to produce an object that follows the structure of the schema. That is, a property of a schema definition can also be a schema definition. In this way, an object can be embedded in the parent object. This allows for relating data that might be semantically understood more easily if it was held in a contained object rather than being properties of the parent object.","source":"@site/docs/03 - Schema/05 - Embedded Objects.md","sourceDirName":"03 - Schema","slug":"/Schema/schema_embedded_objects","permalink":"/mvom/docs/Schema/schema_embedded_objects","draft":false,"unlisted":false,"editUrl":"https://github.com/STORIS/mvom/tree/main/website/docs/03 - Schema/05 - Embedded Objects.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"id":"schema_embedded_objects","title":"Embedded Objects"},"sidebar":"docsSidebar","previous":{"title":"Scalar Arrays","permalink":"/mvom/docs/Schema/schema_scalar_arrays"},"next":{"title":"Object Arrays","permalink":"/mvom/docs/Schema/schema_object_arrays"}}');var s=n(4848),i=n(8453);const o={id:"schema_embedded_objects",title:"Embedded Objects"},r="Embedded Objects",c={},d=[{value:"Example",id:"example",level:2}];function h(e){const t={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.header,{children:(0,s.jsx)(t.h1,{id:"embedded-objects",children:"Embedded Objects"})}),"\n",(0,s.jsx)(t.p,{children:"MVOM will work with the defined schema structure to produce an object that follows the structure of the schema. That is, a property of a schema definition can also be a schema definition. In this way, an object can be embedded in the parent object. This allows for relating data that might be semantically understood more easily if it was held in a contained object rather than being properties of the parent object."}),"\n",(0,s.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,s.jsxs)(t.p,{children:["Consider a file containing customer information that has several attributes which represent the parts of a name: prefix/title, first/given name, middle name, last/family name, and suffix. Along with those attributes, there are several other attributes defining information about that customer. You could simply define a schema with properties such as ",(0,s.jsx)(t.code,{children:"givenName"})," and ",(0,s.jsx)(t.code,{children:"familyName"}),", or you can create an embedded schema definition such as this example:"]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-ts",children:"const schemaDefinition = {\n  name: {\n    prefix: {\n      type: 'string',\n      path: 1,\n    },\n    given: {\n      type: 'string',\n      path: 2,\n    },\n    middle: {\n      type: 'string',\n      path: 3,\n    },\n    family: {\n      type: 'string',\n      path: 4,\n    },\n    suffix: {\n      type: 'string',\n      path: 5,\n    },\n  },\n  someOtherData: {\n    type: 'string',\n    path: 6,\n  },\n};\n\nconst schema = new Schema(schemaDefinition);\n"})}),"\n",(0,s.jsx)(t.p,{children:"This schema would transform into a data structure in the following format:"}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-ts",children:"{\n  name: {\n    prefix: 'Ms.',\n    given: 'Jane',\n    middle: null,\n    family: 'Doe',\n    suffix: null,\n  },\n  someOtherData: 'some other string data'\n}\n"})})]})}function m(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>r});var a=n(6540);const s={},i=a.createContext(s);function o(e){const t=a.useContext(i);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),a.createElement(i.Provider,{value:t},e.children)}}}]);