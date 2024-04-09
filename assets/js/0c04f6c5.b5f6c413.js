"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6544],{3085:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>E,contentTitle:()=>T,default:()=>q,frontMatter:()=>S,metadata:()=>N,toc:()=>C});var a=n(4848),r=n(8453),l=n(6540),o=n(8215),s=n(3104),u=n(6347),i=n(205),c=n(7485),d=n(1682),m=n(9466);function p(e){return l.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,l.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,l.useMemo)((()=>{const e=t??function(e){return p(e).map((e=>{let{props:{value:t,label:n,attributes:a,default:r}}=e;return{value:t,label:n,attributes:a,default:r}}))}(n);return function(e){const t=(0,d.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function f(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function b(e){let{queryString:t=!1,groupId:n}=e;const a=(0,u.W6)(),r=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(r),(0,l.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(a.location.search);t.set(r,e),a.replace({...a.location,search:t.toString()})}),[r,a])]}function v(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,r=h(e),[o,s]=(0,l.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!f({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const a=n.find((e=>e.default))??n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:r}))),[u,c]=b({queryString:n,groupId:a}),[d,p]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,r]=(0,m.Dv)(n);return[a,(0,l.useCallback)((e=>{n&&r.set(e)}),[n,r])]}({groupId:a}),v=(()=>{const e=u??d;return f({value:e,tabValues:r})?e:null})();(0,i.A)((()=>{v&&s(v)}),[v]);return{selectedValue:o,selectValue:(0,l.useCallback)((e=>{if(!f({value:e,tabValues:r}))throw new Error(`Can't select invalid tab value=${e}`);s(e),c(e),p(e)}),[c,p,r]),tabValues:r}}var g=n(2303);const I={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function x(e){let{className:t,block:n,selectedValue:r,selectValue:l,tabValues:u}=e;const i=[],{blockElementScrollPositionUntilNextRender:c}=(0,s.a_)(),d=e=>{const t=e.currentTarget,n=i.indexOf(t),a=u[n].value;a!==r&&(c(t),l(a))},m=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=i.indexOf(e.currentTarget)+1;t=i[n]??i[0];break}case"ArrowLeft":{const n=i.indexOf(e.currentTarget)-1;t=i[n]??i[i.length-1];break}}t?.focus()};return(0,a.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.A)("tabs",{"tabs--block":n},t),children:u.map((e=>{let{value:t,label:n,attributes:l}=e;return(0,a.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>i.push(e),onKeyDown:m,onClick:d,...l,className:(0,o.A)("tabs__item",I.tabItem,l?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function y(e){let{lazy:t,children:n,selectedValue:r}=e;const o=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===r));return e?(0,l.cloneElement)(e,{className:"margin-top--md"}):null}return(0,a.jsx)("div",{className:"margin-top--md",children:o.map(((e,t)=>(0,l.cloneElement)(e,{key:t,hidden:e.props.value!==r})))})}function j(e){const t=v(e);return(0,a.jsxs)("div",{className:(0,o.A)("tabs-container",I.tabList),children:[(0,a.jsx)(x,{...e,...t}),(0,a.jsx)(y,{...e,...t})]})}function w(e){const t=(0,g.A)();return(0,a.jsx)(j,{...e,children:p(e.children)},String(t))}const k={tabItem:"tabItem_Ymn6"};function V(e){let{children:t,hidden:n,className:r}=e;return(0,a.jsx)("div",{role:"tabpanel",className:(0,o.A)(k.tabItem,r),hidden:n,children:t})}const S={id:"installation",title:"Installation"},T="Installation",N={id:"Introduction/installation",title:"Installation",description:"MVOM is available as an npm package. Install using your favorite package manager:",source:"@site/docs/01 - Introduction/02 - Installation.md",sourceDirName:"01 - Introduction",slug:"/Introduction/installation",permalink:"/mvom/docs/Introduction/installation",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/01 - Introduction/02 - Installation.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"installation",title:"Installation"},sidebar:"docsSidebar",previous:{title:"What is MVOM?",permalink:"/mvom/docs/Introduction/what_is_mvom"},next:{title:"Setup and Configuration",permalink:"/mvom/docs/Introduction/setup_and_configuration"}},E={},C=[];function _(e){const t={a:"a",code:"code",h1:"h1",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.h1,{id:"installation",children:"Installation"}),"\n",(0,a.jsxs)(t.p,{children:["MVOM is available as an ",(0,a.jsx)(t.a,{href:"https://www.npmjs.com/",children:"npm"})," package. Install using your favorite package manager:"]}),"\n",(0,a.jsxs)(w,{groupId:"npm2yarn",children:[(0,a.jsx)(V,{value:"npm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"npm install --save mvom\n"})})}),(0,a.jsx)(V,{value:"yarn",label:"Yarn",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"yarn add mvom\n"})})}),(0,a.jsx)(V,{value:"pnpm",label:"pnpm",children:(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-bash",children:"pnpm add mvom\n"})})})]})]})}function q(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(_,{...e})}):_(e)}},8453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>s});var a=n(6540);const r={},l=a.createContext(r);function o(e){const t=a.useContext(l);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function s(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),a.createElement(l.Provider,{value:t},e.children)}}}]);