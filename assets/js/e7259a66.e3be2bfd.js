"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8350],{2949:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>s,default:()=>l,frontMatter:()=>d,metadata:()=>o,toc:()=>c});var r=n(4848),i=n(8453);const d={id:"model_saving",title:"Saving a Model"},s="Saving a Model",o={id:"Model/model_saving",title:"Saving a Model",description:"An instance of a Model can be saved to the database. This save operation can either be the insertion of a new record into the database or the update to an existing record.",source:"@site/docs/04 - Model/04 - Saving a Model.md",sourceDirName:"04 - Model",slug:"/Model/model_saving",permalink:"/mvom/docs/Model/model_saving",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/04 - Model/04 - Saving a Model.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{id:"model_saving",title:"Saving a Model"},sidebar:"docsSidebar",previous:{title:"Reading a Model By ID",permalink:"/mvom/docs/Model/model_reading_by_id"},next:{title:"Deleting a Model",permalink:"/mvom/docs/Model/model_deletion"}},a={},c=[{value:"save Method",id:"save-method",level:2},{value:"Syntax",id:"syntax",level:3},{value:"Parameters",id:"parameters",level:3},{value:"Options Object Properties",id:"options-object-properties",level:4},{value:"Example (Inserting a Record)",id:"example-inserting-a-record",level:3},{value:"Example (Updating a Record)",id:"example-updating-a-record",level:3},{value:"Record Insertion Notes",id:"record-insertion-notes",level:2},{value:"Record Locks",id:"record-locks",level:3},{value:"Record Existence",id:"record-existence",level:3},{value:"Record Update Notes",id:"record-update-notes",level:2},{value:"Handling of attributes which are not defined in the schema",id:"handling-of-attributes-which-are-not-defined-in-the-schema",level:3},{value:"Record Locks",id:"record-locks-1",level:3},{value:"Record Changes",id:"record-changes",level:3}];function h(e){const t={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"saving-a-model",children:"Saving a Model"})}),"\n",(0,r.jsxs)(t.p,{children:["An instance of a ",(0,r.jsx)(t.code,{children:"Model"})," can be saved to the database. This save operation can either be the insertion of a new record into the database or the update to an existing record."]}),"\n",(0,r.jsx)(t.h2,{id:"save-method",children:"save Method"}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"save"})," method inserts or updates an existing record into the database with the contents of the ",(0,r.jsx)(t.code,{children:"Model"})," instance. Prior to saving, the Model is validated to ensure that required values are specified, data can be properly cast into the corresponding database value, and foreign key constraints have been satisfied."]}),"\n",(0,r.jsx)(t.h3,{id:"syntax",children:"Syntax"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"save(options?: ModelSaveOptions): Promise<Model>\n"})}),"\n",(0,r.jsx)(t.h3,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(t.table,{children:[(0,r.jsx)(t.thead,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.th,{children:"Parameter"}),(0,r.jsx)(t.th,{children:"Type"}),(0,r.jsx)(t.th,{children:"Description"})]})}),(0,r.jsx)(t.tbody,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"options"})}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"object"})}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.a,{href:"#options-object-properties",children:"Options object"})," (see below)"]})]})})]}),"\n",(0,r.jsx)(t.h4,{id:"options-object-properties",children:"Options Object Properties"}),"\n",(0,r.jsxs)(t.table,{children:[(0,r.jsx)(t.thead,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.th,{children:"Property"}),(0,r.jsx)(t.th,{children:"Type"}),(0,r.jsx)(t.th,{children:"Description"})]})}),(0,r.jsxs)(t.tbody,{children:[(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"maxReturnPayloadSize"})}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"number"})}),(0,r.jsx)(t.td,{children:"The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used."})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"requestId"})}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"string"})}),(0,r.jsxs)(t.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,r.jsx)(t.code,{children:"X-MVIS-Trace-Id"})]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"userDefined"})}),(0,r.jsx)(t.td,{children:(0,r.jsx)(t.code,{children:"object"})}),(0,r.jsxs)(t.td,{children:["The ",(0,r.jsx)(t.a,{href:"./Advanced%20Topics/model_user_defined_options",children:"user defined options"})," to pass to the database subroutines"]})]})]})]}),"\n",(0,r.jsx)(t.h3,{id:"example-inserting-a-record",children:"Example (Inserting a Record)"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const schema = new Schema({\n  description: { type: 'string', path: 1 },\n  price: { type: 'number', path: 2, dbDecimals: 2 },\n});\n\nconst Item = connection.model(schema, 'ITEM');\n\nconst item = new Item({ _id: '0001', data: { description: 'Racecar Bed', price: 999.99 } });\n\nconst savedItem = await item.save();\n"})}),"\n",(0,r.jsx)(t.h3,{id:"example-updating-a-record",children:"Example (Updating a Record)"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-ts",children:"const schema = new Schema({\n  description: { type: 'string', path: 1 },\n  price: { type: 'number', path: 2, dbDecimals: 2 },\n});\n\nconst Item = connection.model(schema, 'ITEM');\n\nconst item = await Item.findById('0001');\n\nitem.price = 899.99;\nconst updatedItem = await item.save();\nconsole.log(updatedItem.price); // outputs 899.99\n"})}),"\n",(0,r.jsx)(t.h2,{id:"record-insertion-notes",children:"Record Insertion Notes"}),"\n",(0,r.jsx)(t.h3,{id:"record-locks",children:"Record Locks"}),"\n",(0,r.jsxs)(t.p,{children:["MVOM will reject any database insertions for a record that is currently locked (e.g. a ",(0,r.jsx)(t.code,{children:"READU"})," statement). In this scenario, ",(0,r.jsx)(t.code,{children:"save"})," will reject with a ",(0,r.jsx)(t.code,{children:"RecordLockedError"}),"."]}),"\n",(0,r.jsx)(t.h3,{id:"record-existence",children:"Record Existence"}),"\n",(0,r.jsxs)(t.p,{children:["If a ",(0,r.jsx)(t.code,{children:"save"})," operation is performed with a ",(0,r.jsx)(t.code,{children:"Model"})," instance that was created via the ",(0,r.jsx)(t.code,{children:"new"})," operator, the record with the ID corresponding to the ",(0,r.jsx)(t.code,{children:"_id"})," property of the ",(0,r.jsx)(t.code,{children:"Model"})," must not exist. If the record already exists, ",(0,r.jsx)(t.code,{children:"save"})," will reject with a ",(0,r.jsx)(t.code,{children:"DocumentVersionMismatchError"}),"."]}),"\n",(0,r.jsx)(t.h2,{id:"record-update-notes",children:"Record Update Notes"}),"\n",(0,r.jsx)(t.h3,{id:"handling-of-attributes-which-are-not-defined-in-the-schema",children:"Handling of attributes which are not defined in the schema"}),"\n",(0,r.jsx)(t.p,{children:"MVOM does not require that the entirety of a record structure be defined in the schema. This ability allows you to only invest in defining the schema for those properties which are important for the current use case. When updating an existing record, MVOM will only modify properties which are defined by the schema. That is, any attributes which are not defined in the schema will be left unchanged when updating an existing record."}),"\n",(0,r.jsx)(t.h3,{id:"record-locks-1",children:"Record Locks"}),"\n",(0,r.jsxs)(t.p,{children:["MVOM will reject any database updates for a record that is currently locked (e.g. a ",(0,r.jsx)(t.code,{children:"READU"})," statement). In this scenario, ",(0,r.jsx)(t.code,{children:"save"})," will reject with a ",(0,r.jsx)(t.code,{children:"RecordLockedError"}),"."]}),"\n",(0,r.jsx)(t.p,{children:"In scenarios where locks are intended to be transient, we suggest that you implement retry logic to attempt to save the record again."}),"\n",(0,r.jsx)(t.h3,{id:"record-changes",children:"Record Changes"}),"\n",(0,r.jsxs)(t.p,{children:["When a record is read, a ",(0,r.jsx)(t.a,{href:"./Advanced%20Topics/model_version",children:"version string"})," is generated by hashing the contents of the record. This version is stored with the ",(0,r.jsx)(t.code,{children:"Model"})," instance in the ",(0,r.jsx)(t.code,{children:"__v"})," property. When saving a record, this version is compared against the current state of the database record on disk. If the version has changed since the record was read, MVOM will not write the record. When the versions are mismatched, ",(0,r.jsx)(t.code,{children:"save"})," will reject with a ",(0,r.jsx)(t.code,{children:"DocumentVersionMismatchError"}),"."]}),"\n",(0,r.jsx)(t.p,{children:"For records which change often, you should try to read and write the record with as little time between the operations as possible. Similar to handling record locks, implementing retry logic to read, update, and save the record may be beneficial."})]})}function l(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>o});var r=n(6540);const i={},d=r.createContext(i);function s(e){const t=r.useContext(d);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),r.createElement(d.Provider,{value:t},e.children)}}}]);