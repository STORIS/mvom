"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2544],{5823:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>d,default:()=>h,frontMatter:()=>s,metadata:()=>r,toc:()=>l});var i=n(4848),a=n(8453);const s={id:"schema_type_isocalendardatetime",title:"ISOCalendarDateTime"},d="ISOCalendarDateTime Schema Type",r={id:"Schema/Scalar Schema Types/schema_type_isocalendardatetime",title:"ISOCalendarDateTime",description:"The ISOCalendarDateTime schema type allow you to work with compound date-time values.",source:"@site/docs/03 - Schema/02 - Scalar Schema Types/06 - ISOCalendarDateTime.md",sourceDirName:"03 - Schema/02 - Scalar Schema Types",slug:"/Schema/Scalar Schema Types/schema_type_isocalendardatetime",permalink:"/mvom/docs/Schema/Scalar Schema Types/schema_type_isocalendardatetime",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/03 - Schema/02 - Scalar Schema Types/06 - ISOCalendarDateTime.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{id:"schema_type_isocalendardatetime",title:"ISOCalendarDateTime"},sidebar:"docsSidebar",previous:{title:"ISOTime",permalink:"/mvom/docs/Schema/Scalar Schema Types/schema_type_isotime"},next:{title:"Schema Options",permalink:"/mvom/docs/Schema/schema_options"}},c={},l=[{value:"Schema Definition Properties",id:"schema-definition-properties",level:2},{value:"Formatting",id:"formatting",level:2},{value:"dbFormat = &quot;s&quot;",id:"dbformat--s",level:3},{value:"dbFormat = &quot;ms&quot;",id:"dbformat--ms",level:3},{value:"Example",id:"example",level:2}];function o(e){const t={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.h1,{id:"isocalendardatetime-schema-type",children:"ISOCalendarDateTime Schema Type"}),"\n",(0,i.jsx)(t.p,{children:"The ISOCalendarDateTime schema type allow you to work with compound date-time values."}),"\n",(0,i.jsx)(t.h2,{id:"schema-definition-properties",children:"Schema Definition Properties"}),"\n",(0,i.jsxs)(t.p,{children:["In addition to the ",(0,i.jsx)(t.a,{href:"../schema_basics#properties-common-to-all-schema-definition-types",children:"base schema definition properties"})," the ",(0,i.jsx)(t.code,{children:"ISOCalendarDateTime"})," type has the following additional properties:"]}),"\n",(0,i.jsxs)(t.table,{children:[(0,i.jsx)(t.thead,{children:(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.th,{children:"Property"}),(0,i.jsx)(t.th,{children:"Type"}),(0,i.jsx)(t.th,{style:{textAlign:"center"},children:"Mandatory"}),(0,i.jsx)(t.th,{children:"Default"}),(0,i.jsx)(t.th,{children:"Description"})]})}),(0,i.jsxs)(t.tbody,{children:[(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"type"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"ISOCalendarDateTime"'})}),(0,i.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,i.jsx)(t.td,{}),(0,i.jsx)(t.td,{children:"The type literal for an ISOCalendarDateTime schema type"})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"dbFormat"})}),(0,i.jsxs)(t.td,{children:[(0,i.jsx)(t.code,{children:'"s"'})," | ",(0,i.jsx)(t.code,{children:'"ms"'})]}),(0,i.jsx)(t.td,{style:{textAlign:"center"}}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"ms"'})}),(0,i.jsxs)(t.td,{children:[(0,i.jsx)(t.code,{children:'"s"'})," denotes internal time is in seconds",(0,i.jsx)("br",{}),(0,i.jsx)(t.code,{children:'"ms"'})," denotes internal time is in milliseconds"]})]})]})]}),"\n",(0,i.jsx)(t.h2,{id:"formatting",children:"Formatting"}),"\n",(0,i.jsx)(t.admonition,{type:"info",children:(0,i.jsx)(t.p,{children:"This is not a standard MultiValue internally formatted data type."})}),"\n",(0,i.jsxs)(t.p,{children:["An ISOCalendarDateTime schema type will be transformed to and from an internal date-time representation to ISO 8601 times (",(0,i.jsx)(t.code,{children:"YYYY-MM-DDTHH:MM:SS.SSS"}),"). The transformations are conditional based upon the ",(0,i.jsx)(t.code,{children:"dbFormat"})," property value."]}),"\n",(0,i.jsx)(t.h3,{id:"dbformat--s",children:'dbFormat = "s"'}),"\n",(0,i.jsxs)(t.table,{children:[(0,i.jsx)(t.thead,{children:(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.th,{children:"Database Value"}),(0,i.jsx)(t.th,{children:"JavaScript Value"})]})}),(0,i.jsxs)(t.tbody,{children:[(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"0.00000"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"1967-12-31T00:00:00.000"'})})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"19864.43200"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"2022-05-20T12:00:00.000"'})})]})]})]}),"\n",(0,i.jsx)(t.h3,{id:"dbformat--ms",children:'dbFormat = "ms"'}),"\n",(0,i.jsxs)(t.table,{children:[(0,i.jsx)(t.thead,{children:(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.th,{children:"Database Value"}),(0,i.jsx)(t.th,{children:"JavaScript Value"})]})}),(0,i.jsxs)(t.tbody,{children:[(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"0.00000000"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"1967-12-31T00:00:00.000"'})})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:"19864.43200123"})}),(0,i.jsx)(t.td,{children:(0,i.jsx)(t.code,{children:'"2022-05-20T12:00:00.123"'})})]})]})]}),"\n",(0,i.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-ts",children:"const schemaDefinition = {\n  dateTimeProperty: {\n    type: 'ISOCalendarDateTime',\n    path: 1,\n    dictionary: 'DATE_TIME_DICT',\n    required: true,\n    dbFormat: 'ms',\n  },\n};\n\nconst schema = new Schema(schemaDefinition);\n"})})]})}function h(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>d,x:()=>r});var i=n(6540);const a={},s=i.createContext(a);function d(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:d(e.components),i.createElement(s.Provider,{value:t},e.children)}}}]);