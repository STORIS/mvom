"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[201],{894:(e,d,s)=>{s.r(d),s.d(d,{assets:()=>o,contentTitle:()=>r,default:()=>a,frontMatter:()=>t,metadata:()=>c,toc:()=>l});var n=s(4848),i=s(8453);const t={id:"model_reading_by_id",title:"Reading a Model By ID"},r="Reading a Model By ID",c={id:"Model/model_reading_by_id",title:"Reading a Model By ID",description:"MVOM allows reading database records by specifying an ID to the record. The Model class offers two static method findById and findByIds which support this ability.",source:"@site/docs/04 - Model/03 - Reading By Id.md",sourceDirName:"04 - Model",slug:"/Model/model_reading_by_id",permalink:"/mvom/docs/Model/model_reading_by_id",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/04 - Model/03 - Reading By Id.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{id:"model_reading_by_id",title:"Reading a Model By ID"},sidebar:"docsSidebar",previous:{title:"Creating a Model",permalink:"/mvom/docs/Model/model_creation"},next:{title:"Saving a Model",permalink:"/mvom/docs/Model/model_saving"}},o={},l=[{value:"findById Method",id:"findbyid-method",level:2},{value:"Syntax",id:"syntax",level:3},{value:"Parameters",id:"parameters",level:3},{value:"Options Object Properties",id:"options-object-properties",level:4},{value:"Example",id:"example",level:3},{value:"findByIds Method",id:"findbyids-method",level:2},{value:"Syntax",id:"syntax-1",level:3},{value:"Parameters",id:"parameters-1",level:3},{value:"Options Object Properties",id:"options-object-properties-1",level:4},{value:"Example",id:"example-1",level:3}];function h(e){const d={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(d.h1,{id:"reading-a-model-by-id",children:"Reading a Model By ID"}),"\n",(0,n.jsxs)(d.p,{children:["MVOM allows reading database records by specifying an ID to the record. The ",(0,n.jsx)(d.code,{children:"Model"})," class offers two static method ",(0,n.jsx)(d.code,{children:"findById"})," and ",(0,n.jsx)(d.code,{children:"findByIds"})," which support this ability."]}),"\n",(0,n.jsx)(d.h2,{id:"findbyid-method",children:"findById Method"}),"\n",(0,n.jsxs)(d.p,{children:["The ",(0,n.jsx)(d.code,{children:"findById"})," static method is available on all ",(0,n.jsx)(d.code,{children:"Model"})," classes. It allows a consumer to specify a record id which will initiate a call to the MultiValue database to read that record. It will return an instance of the ",(0,n.jsx)(d.code,{children:"Model"})," that contains the data from the record. If no record with that ID exists, ",(0,n.jsx)(d.code,{children:"null"})," will be returned."]}),"\n",(0,n.jsx)(d.h3,{id:"syntax",children:"Syntax"}),"\n",(0,n.jsx)(d.pre,{children:(0,n.jsx)(d.code,{className:"language-ts",children:"static findById(id: string, options?: ModelFindByIdOptions): Promise<Model | null>\n"})}),"\n",(0,n.jsx)(d.h3,{id:"parameters",children:"Parameters"}),"\n",(0,n.jsxs)(d.table,{children:[(0,n.jsx)(d.thead,{children:(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.th,{children:"Parameter"}),(0,n.jsx)(d.th,{children:"Type"}),(0,n.jsx)(d.th,{children:"Description"})]})}),(0,n.jsxs)(d.tbody,{children:[(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"id"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"string"})}),(0,n.jsx)(d.td,{children:"The record ID of the record to read"})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"options"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"object"})}),(0,n.jsxs)(d.td,{children:[(0,n.jsx)(d.a,{href:"#options-object-properties",children:"Options object"})," (see below)"]})]})]})]}),"\n",(0,n.jsx)(d.h4,{id:"options-object-properties",children:"Options Object Properties"}),"\n",(0,n.jsxs)(d.table,{children:[(0,n.jsx)(d.thead,{children:(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.th,{children:"Property"}),(0,n.jsx)(d.th,{children:"Type"}),(0,n.jsx)(d.th,{children:"Description"})]})}),(0,n.jsxs)(d.tbody,{children:[(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"projection"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"string[]"})}),(0,n.jsxs)(d.td,{children:["The ",(0,n.jsx)(d.a,{href:"./Advanced%20Topics/model_projection",children:"projection"})," of properties to return from the database"]})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"maxReturnPayloadSize"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"number"})}),(0,n.jsx)(d.td,{children:"The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used."})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"requestId"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"string"})}),(0,n.jsxs)(d.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,n.jsx)(d.code,{children:"X-MVIS-Trace-Id"})]})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"userDefined"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"object"})}),(0,n.jsxs)(d.td,{children:["The ",(0,n.jsx)(d.a,{href:"./Advanced%20Topics/model_user_defined_options",children:"user defined options"})," to pass to the database subroutines"]})]})]})]}),"\n",(0,n.jsx)(d.h3,{id:"example",children:"Example"}),"\n",(0,n.jsx)(d.p,{children:"Assume there is a database record structured as follows:"}),"\n",(0,n.jsxs)(d.table,{children:[(0,n.jsx)(d.thead,{children:(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.th,{children:"Attribute"}),(0,n.jsx)(d.th,{children:"Value"})]})}),(0,n.jsxs)(d.tbody,{children:[(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:"ID"}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"0001"})})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:"1"}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"Racecar Bed"})})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:"2"}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"99999"})})]})]})]}),"\n",(0,n.jsx)(d.p,{children:"The following code would allow reading of that record:"}),"\n",(0,n.jsx)(d.pre,{children:(0,n.jsx)(d.code,{className:"language-ts",children:"const schema = new Schema({\n  description: { type: 'string', path: 1 },\n  price: { type: 'number', path: 2, dbDecimals: 2 },\n});\n\nconst Item = connection.model(schema, 'ITEM');\n\nconst item = await Item.findById('0001');\n"})}),"\n",(0,n.jsxs)(d.p,{children:["The value of ",(0,n.jsx)(d.code,{children:"item"})," would be:"]}),"\n",(0,n.jsx)(d.pre,{children:(0,n.jsx)(d.code,{className:"language-ts",children:'{\n  description: "Racecar Bed",\n  price: 999.99\n}\n'})}),"\n",(0,n.jsx)(d.h2,{id:"findbyids-method",children:"findByIds Method"}),"\n",(0,n.jsxs)(d.p,{children:["The ",(0,n.jsx)(d.code,{children:"findByIds"})," static method is very similar to the ",(0,n.jsx)(d.code,{children:"findById"})," static method. The primary difference between the two is that ",(0,n.jsx)(d.code,{children:"findByIds"})," will accept an array of IDs to read and return an array of ",(0,n.jsx)(d.code,{children:"Model"})," instances. If no record with one of the provided IDs exists, ",(0,n.jsx)(d.code,{children:"null"})," will be returned."]}),"\n",(0,n.jsx)(d.h3,{id:"syntax-1",children:"Syntax"}),"\n",(0,n.jsx)(d.pre,{children:(0,n.jsx)(d.code,{className:"language-ts",children:"static findByIds(ids: string | string[], options?: ModelFindByIdOptions): Promise<(Model | null)[]>\n"})}),"\n",(0,n.jsx)(d.h3,{id:"parameters-1",children:"Parameters"}),"\n",(0,n.jsxs)(d.table,{children:[(0,n.jsx)(d.thead,{children:(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.th,{children:"Parameter"}),(0,n.jsx)(d.th,{children:"Type"}),(0,n.jsx)(d.th,{children:"Description"})]})}),(0,n.jsxs)(d.tbody,{children:[(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"ids"})}),(0,n.jsxs)(d.td,{children:[(0,n.jsx)(d.code,{children:"string"})," | ",(0,n.jsx)(d.code,{children:"string[]"})]}),(0,n.jsx)(d.td,{children:"The record ID or IDs of the record(s) to read"})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"options"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"object"})}),(0,n.jsxs)(d.td,{children:[(0,n.jsx)(d.a,{href:"#options-object-properties-1",children:"Options object"})," (see below)"]})]})]})]}),"\n",(0,n.jsx)(d.h4,{id:"options-object-properties-1",children:"Options Object Properties"}),"\n",(0,n.jsxs)(d.table,{children:[(0,n.jsx)(d.thead,{children:(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.th,{children:"Property"}),(0,n.jsx)(d.th,{children:"Type"}),(0,n.jsx)(d.th,{children:"Description"})]})}),(0,n.jsxs)(d.tbody,{children:[(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"projection"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"string[]"})}),(0,n.jsxs)(d.td,{children:["The ",(0,n.jsx)(d.a,{href:"./Advanced%20Topics/model_projection",children:"projection"})," of properties to return from the database"]})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"maxReturnPayloadSize"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"number"})}),(0,n.jsx)(d.td,{children:"The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. If omitted the value specified during connection creation is used."})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"requestId"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"string"})}),(0,n.jsxs)(d.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,n.jsx)(d.code,{children:"X-MVIS-Trace-Id"})]})]}),(0,n.jsxs)(d.tr,{children:[(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"userDefined"})}),(0,n.jsx)(d.td,{children:(0,n.jsx)(d.code,{children:"object"})}),(0,n.jsxs)(d.td,{children:["The ",(0,n.jsx)(d.a,{href:"./Advanced%20Topics/model_user_defined_options",children:"user defined options"})," to pass to the database subroutines"]})]})]})]}),"\n",(0,n.jsx)(d.h3,{id:"example-1",children:"Example"}),"\n",(0,n.jsx)(d.pre,{children:(0,n.jsx)(d.code,{className:"language-ts",children:"const schema = new Schema({\n  description: { type: 'string', path: 1 },\n  price: { type: 'number', path: 2, dbDecimals: 2 },\n});\n\nconst Item = connection.model(schema, 'ITEM');\n\nconst items = await Item.findByIds(['0001', '0002']);\n"})})]})}function a(e={}){const{wrapper:d}={...(0,i.R)(),...e.components};return d?(0,n.jsx)(d,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},8453:(e,d,s)=>{s.d(d,{R:()=>r,x:()=>c});var n=s(6540);const i={},t=n.createContext(i);function r(e){const d=n.useContext(t);return n.useMemo((function(){return"function"==typeof e?e(d):{...d,...e}}),[d,e])}function c(e){let d;return d=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),n.createElement(t.Provider,{value:d},e.children)}}}]);