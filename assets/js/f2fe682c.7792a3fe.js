"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2735],{9905:(e,t,s)=>{s.r(t),s.d(t,{assets:()=>d,contentTitle:()=>r,default:()=>h,frontMatter:()=>n,metadata:()=>o,toc:()=>c});const o=JSON.parse('{"id":"Model/Advanced Topics/model_schemaless","title":"Schemaless Models","description":"On occasion, MultiValue records will be used in a manner that does not lend itself to defining a schema. The flexibility of the MultiValue data structure allows records to take amorphous shapes. For instance, a MultiValue record might be a dynamically sized list of strings with each attribute containing one item from the list. It is not possible to define a Schema for these types of records, but consumers of MVOM might still wish to work with records of that nature. Schemaless models allow for that functionality. To create a Model that does not have a schema, you should provide null for the schema parameter in the call to connection.model.","source":"@site/docs/04 - Model/07 - Advanced Topics/03 - Schemaless Models.md","sourceDirName":"04 - Model/07 - Advanced Topics","slug":"/Model/Advanced Topics/model_schemaless","permalink":"/mvom/docs/Model/Advanced Topics/model_schemaless","draft":false,"unlisted":false,"editUrl":"https://github.com/STORIS/mvom/tree/main/website/docs/04 - Model/07 - Advanced Topics/03 - Schemaless Models.md","tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"id":"model_schemaless","title":"Schemaless Models"},"sidebar":"docsSidebar","previous":{"title":"Projection","permalink":"/mvom/docs/Model/Advanced Topics/model_projection"},"next":{"title":"Reading Encoded Data","permalink":"/mvom/docs/Model/Advanced Topics/model_reading_encoded"}}');var a=s(4848),l=s(8453);const n={id:"model_schemaless",title:"Schemaless Models"},r="Schemaless Models",d={},c=[{value:"The _raw Property",id:"the-_raw-property",level:2},{value:"Example",id:"example",level:2}];function i(e){const t={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,l.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.header,{children:(0,a.jsx)(t.h1,{id:"schemaless-models",children:"Schemaless Models"})}),"\n",(0,a.jsxs)(t.p,{children:["On occasion, MultiValue records will be used in a manner that does not lend itself to defining a schema. The flexibility of the MultiValue data structure allows records to take amorphous shapes. For instance, a MultiValue record might be a dynamically sized list of strings with each attribute containing one item from the list. It is not possible to define a Schema for these types of records, but consumers of MVOM might still wish to work with records of that nature. Schemaless models allow for that functionality. To create a ",(0,a.jsx)(t.code,{children:"Model"})," that does not have a schema, you should provide ",(0,a.jsx)(t.code,{children:"null"})," for the schema parameter in the call to ",(0,a.jsx)(t.code,{children:"connection.model"}),"."]}),"\n",(0,a.jsxs)(t.p,{children:["A ",(0,a.jsx)(t.code,{children:"Model"})," instance that was created with a schema will have properties that match the schema. That is, the shape of the ",(0,a.jsx)(t.code,{children:"Model"})," object will align with that of the schema. However, schemaless models cannot work that way since they do not have schemas. Instead, a ",(0,a.jsx)(t.code,{children:"Model"})," that is created without a ",(0,a.jsx)(t.code,{children:"Schema"})," will instead have a property ",(0,a.jsx)(t.code,{children:"_raw"})," on it."]}),"\n",(0,a.jsx)(t.h2,{id:"the-_raw-property",children:"The _raw Property"}),"\n",(0,a.jsxs)(t.p,{children:["The ",(0,a.jsx)(t.code,{children:"_raw"})," property is fairly simple. After reading a record using a schemaless model, the ",(0,a.jsx)(t.code,{children:"_raw"})," property will be populated with an array that matches the MultiValue data structure. Attributes will be converted to values of the array. If attributes contain values or the values contain subvalues, then the array will be multidimensional."]}),"\n",(0,a.jsxs)(t.p,{children:["Consumers can work with the ",(0,a.jsx)(t.code,{children:"_raw"})," property of the ",(0,a.jsx)(t.code,{children:"Model"})," instance as they would any other array. Upon saving, the ",(0,a.jsx)(t.code,{children:"_raw"})," property will be turned back into a MultiValue record by converting the array into attributes, values, and subvalues."]}),"\n",(0,a.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,a.jsx)(t.p,{children:"Suppose you had a database record structured as follows:"}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{children:"Attribute"}),(0,a.jsx)(t.th,{children:"Value"})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"ID"}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"0001"})})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"1"}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"foo"})})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"2"}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"bar"})})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"3"}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"baz"})})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{children:"4"}),(0,a.jsx)(t.td,{children:(0,a.jsx)(t.code,{children:"qux{vm}quux"})})]})]})]}),"\n",(0,a.jsxs)(t.p,{children:["You could create and read using a schemaless ",(0,a.jsx)(t.code,{children:"Model"})," as follows:"]}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-ts",children:"const Schemaless = connection.model(null, 'SOME_FILE');\n\nconst schemaless = await Schemaless.findById('0001');\nconsole.log(schemaless._raw); // outputs ['foo', 'bar', 'baz', ['qux', 'quux']]\n\nschemaless._raw.push('last in line');\nschemaless.save();\n"})})]})}function h(e={}){const{wrapper:t}={...(0,l.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(i,{...e})}):i(e)}},8453:(e,t,s)=>{s.d(t,{R:()=>n,x:()=>r});var o=s(6540);const a={},l=o.createContext(a);function n(e){const t=o.useContext(l);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:n(e.components),o.createElement(l.Provider,{value:t},e.children)}}}]);