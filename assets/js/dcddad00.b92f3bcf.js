"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4383],{2109:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>h,frontMatter:()=>r,metadata:()=>d,toc:()=>a});var o=n(4848),i=n(8453);const r={id:"model_query_sorting",title:"Sorting"},s="Sorting",d={id:"Model/Querying/model_query_sorting",title:"Sorting",description:"Query results can be sorted by using the sort property of the query options. sort accepts an array of a 2-tuple. The first index of the tuple is the property name associated with a dictionary that you wish to sort on and the second index of the tuple is either 1 to indicate ascending sort or -1 to indicate descending sort. Sort criteria will be added in the order in which they appear in the array, so this mechanism can be used in order to prioritize sort behavior.",source:"@site/docs/04 - Model/06 - Querying/05 - Sorting.md",sourceDirName:"04 - Model/06 - Querying",slug:"/Model/Querying/model_query_sorting",permalink:"/mvom/docs/Model/Querying/model_query_sorting",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/04 - Model/06 - Querying/05 - Sorting.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{id:"model_query_sorting",title:"Sorting"},sidebar:"docsSidebar",previous:{title:"Pagination",permalink:"/mvom/docs/Model/Querying/model_query_pagination"},next:{title:"The __v Property",permalink:"/mvom/docs/Model/Advanced Topics/model_version"}},c={},a=[{value:"Example",id:"example",level:2}];function l(e){const t={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",...(0,i.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.h1,{id:"sorting",children:"Sorting"}),"\n",(0,o.jsxs)(t.p,{children:["Query results can be sorted by using the ",(0,o.jsx)(t.code,{children:"sort"})," property of the ",(0,o.jsx)(t.a,{href:"model_query_basics#options-object-properties",children:"query options"}),". ",(0,o.jsx)(t.code,{children:"sort"})," accepts an array of a 2-tuple. The first index of the tuple is the property name associated with a dictionary that you wish to sort on and the second index of the tuple is either ",(0,o.jsx)(t.code,{children:"1"})," to indicate ascending sort or ",(0,o.jsx)(t.code,{children:"-1"})," to indicate descending sort. Sort criteria will be added in the order in which they appear in the array, so this mechanism can be used in order to prioritize sort behavior."]}),"\n",(0,o.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,o.jsx)(t.p,{children:"The following query will sort by descending price as the primary sort condition and by ascending description as the secondary sort condition."}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{className:"language-ts",children:"const schema = new Schema({\n  description: { type: 'string', path: 1, dictionary: 'DESCRIPTION' },\n  price: { type: 'number', path: 2, dbDecimals: 2, dictionary: 'PRICE' },\n});\n\nconst Item = connection.model(schema, 'ITEM');\n\nconst items = await Item.find(\n  {},\n  {\n    sort: [\n      ['price', -1],\n      ['description', 1],\n    ],\n  },\n);\n"})}),"\n",(0,o.jsx)(t.p,{children:"The query which will be executed on the MultiValue database is:"}),"\n",(0,o.jsx)(t.pre,{children:(0,o.jsx)(t.code,{children:"select ITEM by.dsnd PRICE by DESCRIPTION\n"})})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>d});var o=n(6540);const i={},r=o.createContext(i);function s(e){const t=o.useContext(r);return o.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function d(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:s(e.components),o.createElement(r.Provider,{value:t},e.children)}}}]);