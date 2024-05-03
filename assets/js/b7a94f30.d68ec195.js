"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6443],{9888:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>a,frontMatter:()=>d,metadata:()=>i,toc:()=>h});var c=r(4848),n=r(8453);const d={id:"document",title:"Document"},s="Document",i={id:"document",title:"Document",description:"The Document class is the superclass of the Model class. Essentially a Document is a Model without any of the database access functionality of the Model class. A Document has a Schema but it does not have a Connection. Most consumers will never need to interact directly with a Document.",source:"@site/docs/05 - Document.md",sourceDirName:".",slug:"/document",permalink:"/mvom/docs/document",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/05 - Document.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"document",title:"Document"},sidebar:"docsSidebar",previous:{title:"Request Log Tracing",permalink:"/mvom/docs/Model/Advanced Topics/model_request_log_tracing"}},o={},h=[{value:"createDocumentFromRecordString Method",id:"createdocumentfromrecordstring-method",level:2},{value:"Syntax",id:"syntax",level:3},{value:"Parameters",id:"parameters",level:3},{value:"dbServerDelimiters Object",id:"dbserverdelimiters-object",level:4}];function l(e){const t={code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,n.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(t.h1,{id:"document",children:"Document"}),"\n",(0,c.jsxs)(t.p,{children:["The ",(0,c.jsx)(t.code,{children:"Document"})," class is the superclass of the ",(0,c.jsx)(t.code,{children:"Model"})," class. Essentially a ",(0,c.jsx)(t.code,{children:"Document"})," is a ",(0,c.jsx)(t.code,{children:"Model"})," without any of the database access functionality of the ",(0,c.jsx)(t.code,{children:"Model"})," class. A ",(0,c.jsx)(t.code,{children:"Document"})," has a ",(0,c.jsx)(t.code,{children:"Schema"})," but it does not have a ",(0,c.jsx)(t.code,{children:"Connection"}),". Most consumers will never need to interact directly with a ",(0,c.jsx)(t.code,{children:"Document"}),"."]}),"\n",(0,c.jsx)(t.h2,{id:"createdocumentfromrecordstring-method",children:"createDocumentFromRecordString Method"}),"\n",(0,c.jsxs)(t.p,{children:["The ",(0,c.jsx)(t.code,{children:"Document"})," class exposes a static method ",(0,c.jsx)(t.code,{children:"createDocumentFromRecordString"}),". This factory method allows for creation of a ",(0,c.jsx)(t.code,{children:"Document"})," instance from a string of delimited data representing a MultiValue record. The returned value from this method will be a ",(0,c.jsx)(t.code,{children:"Document"})," instance which has formatted that delimited string according to the schema."]}),"\n",(0,c.jsxs)(t.p,{children:["If you ever have a need to construct an object from an MVOM ",(0,c.jsx)(t.code,{children:"Schema"})," that did not originate from a ",(0,c.jsx)(t.code,{children:"Model"})," then this method will prove useful."]}),"\n",(0,c.jsx)(t.h3,{id:"syntax",children:"Syntax"}),"\n",(0,c.jsx)(t.pre,{children:(0,c.jsx)(t.code,{className:"language-ts",children:"static createDocumentFromRecordString(schema: Schema, recordString: string, dbServerDelimiters: object): Document\n"})}),"\n",(0,c.jsx)(t.h3,{id:"parameters",children:"Parameters"}),"\n",(0,c.jsxs)(t.table,{children:[(0,c.jsx)(t.thead,{children:(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.th,{children:"Parameter"}),(0,c.jsx)(t.th,{children:"Type"}),(0,c.jsx)(t.th,{children:"Description"})]})}),(0,c.jsxs)(t.tbody,{children:[(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"schema"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"Schema"})}),(0,c.jsx)(t.td,{children:"An instance of an MVOM schema"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"recordString"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"string"})}),(0,c.jsx)(t.td,{children:"A string of data delimited with MultiValue attribute, value, and subvalue marks"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"dbServerDelimiters"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"object"})}),(0,c.jsx)(t.td,{children:"An object containing the characters which represent record, attribute, value, and subvalue marks in the delimited string"})]})]})]}),"\n",(0,c.jsx)(t.h4,{id:"dbserverdelimiters-object",children:"dbServerDelimiters Object"}),"\n",(0,c.jsxs)(t.table,{children:[(0,c.jsx)(t.thead,{children:(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.th,{children:"Property"}),(0,c.jsx)(t.th,{children:"Type"}),(0,c.jsx)(t.th,{children:"Description"})]})}),(0,c.jsxs)(t.tbody,{children:[(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"rm"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"string"})}),(0,c.jsx)(t.td,{children:"The character representing the record mark"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"am"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"string"})}),(0,c.jsx)(t.td,{children:"The character representing the attribute mark"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"vm"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"string"})}),(0,c.jsx)(t.td,{children:"The character representing the value mark"})]}),(0,c.jsxs)(t.tr,{children:[(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"svm"})}),(0,c.jsx)(t.td,{children:(0,c.jsx)(t.code,{children:"string"})}),(0,c.jsx)(t.td,{children:"The character representing the subvalue mark"})]})]})]})]})}function a(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,c.jsx)(t,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}},8453:(e,t,r)=>{r.d(t,{R:()=>s,x:()=>i});var c=r(6540);const n={},d=c.createContext(n);function s(e){const t=c.useContext(d);return c.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:s(e.components),c.createElement(d.Provider,{value:t},e.children)}}}]);