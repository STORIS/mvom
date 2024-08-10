"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7568],{1999:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>a,toc:()=>c});var i=t(4848),s=t(8453);const r={id:"what_is_mvom",title:"What is MVOM?"},o="What is MVOM?",a={id:"Introduction/what_is_mvom",title:"What is MVOM?",description:"MVOM (MultiValue Object Mapper) is a library which provides the ability to access Multivalue databases (e.g. Unidata, Universe) using applications written for Node.js.",source:"@site/docs/01 - Introduction/01 - What is MVOM.md",sourceDirName:"01 - Introduction",slug:"/Introduction/what_is_mvom",permalink:"/mvom/docs/Introduction/what_is_mvom",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/01 - Introduction/01 - What is MVOM.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{id:"what_is_mvom",title:"What is MVOM?"},sidebar:"docsSidebar",next:{title:"Installation",permalink:"/mvom/docs/Introduction/installation"}},l={},c=[{value:"Requirements",id:"requirements",level:2},{value:"How it works",id:"how-it-works",level:2},{value:"Features",id:"features",level:2}];function d(e){const n={a:"a",admonition:"admonition",h1:"h1",h2:"h2",header:"header",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"what-is-mvom",children:"What is MVOM?"})}),"\n",(0,i.jsxs)(n.p,{children:["MVOM (",(0,i.jsx)(n.strong,{children:"M"}),"ulti",(0,i.jsx)(n.strong,{children:"V"}),"alue ",(0,i.jsx)(n.strong,{children:"O"}),"bject ",(0,i.jsx)(n.strong,{children:"M"}),"apper) is a library which provides the ability to access Multivalue databases (e.g. ",(0,i.jsx)(n.a,{href:"https://www.rocketsoftware.com/products/rocket-unidata-0",children:"Unidata"}),", ",(0,i.jsx)(n.a,{href:"https://www.rocketsoftware.com/products/rocket-universe-0",children:"Universe"}),") using applications written for Node.js."]}),"\n",(0,i.jsx)(n.h2,{id:"requirements",children:"Requirements"}),"\n",(0,i.jsx)(n.admonition,{type:"danger",children:(0,i.jsxs)(n.p,{children:["The creators of MVOM work with Unidata exclusively. This has not been tested on Universe. If you would like to help us test and ensure everything works on Universe, please ",(0,i.jsx)(n.a,{href:"https://github.com/STORIS/mvom/issues/new",children:"log an issue"})," and let us know."]})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["MultiValue Database Server","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Unidata (version 8.2.1 or higher)"}),"\n",(0,i.jsx)(n.li,{children:"Universe (see warning above)"}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.li,{children:"MultiValue Integration Server (version 1.3.0 or higher)"}),"\n",(0,i.jsx)(n.li,{children:"Node.js (version 18.0.0 or higher)"}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"how-it-works",children:"How it works"}),"\n",(0,i.jsxs)(n.p,{children:["MVOM works with the ",(0,i.jsx)(n.a,{href:"https://www.rocketsoftware.com/products/rocket-multivalue-integration-server",children:"Rocket MultiValue Integration Server"})," (MVIS) to proxy requests from your Node.js application to the MultiValue database server. MVIS maintains connectivity to one or more MultiValue database servers and/or accounts using the standard UniRPC protocol and allows client requests from a variety of different protocols. In the case of MVOM, it relies on MVIS' REST server functionality to issue http requests to MVIS which executes UniBasic subroutines on the database server. The responses from these subroutines is then processed by MVOM and returned to the client application."]}),"\n",(0,i.jsx)(n.h2,{id:"features",children:"Features"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Declarative database schema mapping"}),"\n",(0,i.jsxs)(n.li,{children:["MultiValue to/from Object data transformations","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"String"}),"\n",(0,i.jsx)(n.li,{children:"Number"}),"\n",(0,i.jsx)(n.li,{children:"Boolean"}),"\n",(0,i.jsx)(n.li,{children:"Date"}),"\n",(0,i.jsx)(n.li,{children:"Time"}),"\n",(0,i.jsx)(n.li,{children:"Date-Time"}),"\n",(0,i.jsx)(n.li,{children:"Scalar arrays"}),"\n",(0,i.jsx)(n.li,{children:"Associative arrays"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["Data Validations","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Required value validation"}),"\n",(0,i.jsx)(n.li,{children:"Foreign key constraint validation"}),"\n",(0,i.jsx)(n.li,{children:"Data type validation and coercion"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["Database operations","\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Read"}),"\n",(0,i.jsx)(n.li,{children:"Write"}),"\n",(0,i.jsx)(n.li,{children:"Delete"}),"\n",(0,i.jsx)(n.li,{children:"Query"}),"\n"]}),"\n"]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>a});var i=t(6540);const s={},r=i.createContext(s);function o(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);