"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[251],{3905:function(e,t,r){r.d(t,{Zo:function(){return d},kt:function(){return m}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),l=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},d=function(e){var t=l(e.components);return n.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},p=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,d=c(e,["components","mdxType","originalType","parentName"]),p=l(r),m=o,g=p["".concat(s,".").concat(m)]||p[m]||u[m]||a;return r?n.createElement(g,i(i({ref:t},d),{},{components:r})):n.createElement(g,i({ref:t},d))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=p;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:o,i[1]=c;for(var l=2;l<a;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}p.displayName="MDXCreateElement"},5839:function(e,t,r){r.r(t),r.d(t,{assets:function(){return d},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return c},metadata:function(){return l},toc:function(){return u}});var n=r(7462),o=r(3366),a=(r(7294),r(3905)),i=["components"],c={id:"model_request_log_tracing",title:"Request Log Tracing"},s="Request Log Tracing",l={unversionedId:"Model/Advanced Topics/model_request_log_tracing",id:"Model/Advanced Topics/model_request_log_tracing",title:"Request Log Tracing",description:"In complex applications where many different processes interact to handle a request it can be difficult to trace the flow of data in the event of an error. One approach is to collect the logs emitted by the separate processes in a log aggregator such as ElasticSearch, Datadog, or Splunk. A unique request or trace id is passed between processes and any emitted logs contain this id. The id can be used to filter and group the logs.",source:"@site/docs/04 - Model/07 - Advanced Topics/07 - Request Log Tracing.md",sourceDirName:"04 - Model/07 - Advanced Topics",slug:"/Model/Advanced Topics/model_request_log_tracing",permalink:"/mvom/docs/Model/Advanced Topics/model_request_log_tracing",draft:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/04 - Model/07 - Advanced Topics/07 - Request Log Tracing.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{id:"model_request_log_tracing",title:"Request Log Tracing"},sidebar:"docsSidebar",previous:{title:"User Defined Options",permalink:"/mvom/docs/Model/Advanced Topics/model_user_defined_options"},next:{title:"Document",permalink:"/mvom/docs/document"}},d={},u=[],p={toc:u};function m(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"request-log-tracing"},"Request Log Tracing"),(0,a.kt)("p",null,"In complex applications where many different processes interact to handle a request it can be difficult to trace the flow of data in the event of an error. One approach is to collect the logs emitted by the separate processes in a log aggregator such as ElasticSearch, Datadog, or Splunk. A unique request or trace id is passed between processes and any emitted logs contain this id. The id can be used to filter and group the logs."),(0,a.kt)("p",null,"All connection, query, info, and save methods in MVOM accept an optional property called ",(0,a.kt)("inlineCode",{parentName:"p"},"requestId"),". This value is sent to MVIS in a header called ",(0,a.kt)("inlineCode",{parentName:"p"},"X-MVIS-Trace-Id"),". If a ",(0,a.kt)("inlineCode",{parentName:"p"},"requestId")," is not provided MVOM will generate a UUID."),(0,a.kt)("p",null,"Below are some sample logs from MVIS with a request/trace id:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"[X-MVIS-Trace-Id:ROOT: 479e88db-03e6-4229-a869-716ed61a6c1f] 2023-03-03 17:50:10:731 [qtp712627377-120766] ERROR com.rs.u2.u2rest.b.c - [account] U2DataStore: callSubroutine() 81015: The connection has timed out\n[X-MVIS-Trace-Id:ROOT: 479e88db-03e6-4229-a869-716ed61a6c1f] 2023-03-03 17:50:10:731 [qtp712627377-120766] ERROR com.rs.u2.u2rest.b.c - Timeout occurred while processing request: Exception: Failed to complete calling a subroutine: mvom_entry@0.2.0 asjava.b.x: The connection has timed out.\n")),(0,a.kt)("admonition",{type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Support for request/trace ids was introduced in MVIS 1.3.2. In earlier versions of MVIS the ",(0,a.kt)("inlineCode",{parentName:"p"},"X-MVIS-Trace-Id")," header is ignored.")),(0,a.kt)("p",null,"As explained in ",(0,a.kt)("a",{parentName:"p",href:"model_detecting_mvom"},"Detecting MVOM in Triggers"),", MVOM does not interact with your MultiValue Basic programs directly. However, writes to any files with triggers established will cause your trigger programs to run. If you would like to utilize the request id in your your trigger subroutines, you can declare your own ",(0,a.kt)("inlineCode",{parentName:"p"},"/S$MVOM/")," named common area:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"COM /S$MVOM/ S$MVOM.PROCESS\nCOM /S$MVOM/ S$MVOM.USER1, S$MVOM.USER2, S$MVOM.USER3, S$MVOM.USER4, S$MVOM.USER5\nCOM /S$MVOM/ S$REQUEST.ID\n")),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"S$REQUEST.ID")," will be set to the value of ",(0,a.kt)("inlineCode",{parentName:"p"},"requestId")," either autogenerated or provided to any MVOM connection, info, query, or save method. By utilizing a request id, logs emitted by your application, MVIS, and trigger subroutines can be grouped together."),(0,a.kt)("p",null,"Related: ",(0,a.kt)("a",{parentName:"p",href:"model_detecting_mvom"},"Detecting MVOM in Triggers")))}m.isMDXComponent=!0}}]);