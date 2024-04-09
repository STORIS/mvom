"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9074],{3541:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>o,toc:()=>a});var s=t(4848),i=t(8453);const r={id:"connection",title:"Connection"},c="Connection",o={id:"connection",title:"Connection",description:"The first step to working with MVOM is to establish a connection to the database server via MVIS. Establishing a connection is facilitated via the Connection class which is exported from MVOM as a named export.",source:"@site/docs/02 - Connection.md",sourceDirName:".",slug:"/connection",permalink:"/mvom/docs/connection",draft:!1,unlisted:!1,editUrl:"https://github.com/STORIS/mvom/tree/main/website/docs/02 - Connection.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"connection",title:"Connection"},sidebar:"docsSidebar",previous:{title:"Setup and Configuration",permalink:"/mvom/docs/Introduction/setup_and_configuration"},next:{title:"Schema Basics",permalink:"/mvom/docs/Schema/schema_basics"}},d={},a=[{value:"Creating a connection",id:"creating-a-connection",level:2},{value:"Syntax",id:"syntax",level:3},{value:"Parameters",id:"parameters",level:3},{value:"Options Object Properties",id:"options-object-properties",level:4},{value:"Example",id:"example",level:3},{value:"Opening a connection",id:"opening-a-connection",level:2},{value:"Syntax",id:"syntax-1",level:3},{value:"Parameters",id:"parameters-1",level:3},{value:"Options Object Properties",id:"options-object-properties-1",level:4},{value:"Example",id:"example-1",level:3},{value:"Deploying MVOM database server features",id:"deploying-mvom-database-server-features",level:2},{value:"Syntax",id:"syntax-2",level:3},{value:"Parameters",id:"parameters-2",level:3},{value:"Options Object Properties",id:"options-object-properties-2",level:4},{value:"Example",id:"example-2",level:3},{value:"Getting the current database date",id:"getting-the-current-database-date",level:2},{value:"Syntax",id:"syntax-3",level:3},{value:"Parameters",id:"parameters-3",level:3},{value:"Options Object Properties",id:"options-object-properties-3",level:4},{value:"Getting the current database time",id:"getting-the-current-database-time",level:2},{value:"Syntax",id:"syntax-4",level:3},{value:"Parameters",id:"parameters-4",level:3},{value:"Options Object Properties",id:"options-object-properties-4",level:4},{value:"Getting the current database date-time",id:"getting-the-current-database-date-time",level:2},{value:"Syntax",id:"syntax-5",level:3},{value:"Parameters",id:"parameters-5",level:3},{value:"Options Object Properties",id:"options-object-properties-5",level:4},{value:"Logger interface",id:"logger-interface",level:2},{value:"Example",id:"example-3",level:3}];function l(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"connection",children:"Connection"}),"\n",(0,s.jsxs)(n.p,{children:["The first step to working with MVOM is to establish a connection to the database server via MVIS. Establishing a connection is facilitated via the ",(0,s.jsx)(n.code,{children:"Connection"})," class which is exported from MVOM as a named export."]}),"\n",(0,s.jsx)(n.h2,{id:"creating-a-connection",children:"Creating a connection"}),"\n",(0,s.jsxs)(n.p,{children:["A connection to the database server is established using the ",(0,s.jsx)(n.code,{children:"createConnection"})," static factory method of the ",(0,s.jsx)(n.code,{children:"Connection"})," class. Calling this method will return an instance of the ",(0,s.jsx)(n.code,{children:"Connection"})," class."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"Connection.createConnection(mvisUrl: string, mvisAdminUrl: string, mvisAdminUsername: string, mvisAdminPassword: string, account: string, options?: CreateConnectionOptions): Connection\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvisUrl"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The URL to the MVIS server instance"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"http://foo.bar.com"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvisAdminUrl"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The URL of the MVIS Admin instance"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvis-admin.bar.com"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvisAdminUsername"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The username of a user account associated with the MVIS admin instance"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"username"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvisAdminPassword"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The password of a user account associated with the MVIS admin instance"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"password"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"account"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The account name as defined in MVIS configuration"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"demo"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"logger"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"Logger"})}),(0,s.jsx)(n.td,{}),(0,s.jsxs)(n.td,{children:["An object implementing the ",(0,s.jsx)(n.a,{href:"#logger-interface",children:"Logger"})," interface, used for logging messages emitted by MVOM"]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"cacheMaxAge"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"3600"})}),(0,s.jsx)(n.td,{children:"The maximum age of cached connection information, such as the current database date"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"timeout"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"0"})}),(0,s.jsx)(n.td,{children:"The request timeout in milliseconds (0 to disable)"})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"httpAgent"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"http.Agent"})}),(0,s.jsx)(n.td,{}),(0,s.jsxs)(n.td,{children:["An ",(0,s.jsx)(n.code,{children:"http.Agent"})," instance to use with http requests (recommended)"]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"httpsAgent"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"https.Agent"})}),(0,s.jsx)(n.td,{}),(0,s.jsxs)(n.td,{children:["An ",(0,s.jsx)(n.code,{children:"https.Agent"})," instance to use with https requests (recommended)"]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"maxReturnPayloadSize"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"100_000_000"})}),(0,s.jsx)(n.td,{children:"The maximum allowed return payload size in bytes. If this size is exceeded a DbServerError will be thrown. Returning large payloads can have a significant impact on performance and is often the result of invalid database records or an improperly configured query; ie forgetting to use pagination. Tune this value to match your datasets and the type of queries you issue. This can also be configured on a per request basis."})]})]})]}),"\n",(0,s.jsx)(n.h3,{id:"example",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { Connection } from 'mvom';\n\nconst mvisUri = 'http://foo.bar.com';\nconst account = 'demo';\nconst options = { timeout: 30_000 };\n\nconst connection = Connection.createConnection(mvisUri, account, options);\n"})}),"\n",(0,s.jsx)(n.h2,{id:"opening-a-connection",children:"Opening a connection"}),"\n",(0,s.jsxs)(n.p,{children:["After a ",(0,s.jsx)(n.code,{children:"Connection"})," instance has been created, the connection must be opened before it can be used. The process of opening a connection will contact the MultiValue server and verify that the necessary database server subroutines have been installed. If they are available then the connection will be ready for use."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax-1",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"open(options?: OpenOptions): Promise<void>\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters-1",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties-1",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties-1",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"requestId"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"randomly generated UUID"}),(0,s.jsxs)(n.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,s.jsx)(n.code,{children:"X-MVIS-Trace-Id"})]})]})})]}),"\n",(0,s.jsx)(n.h3,{id:"example-1",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { Connection } from 'mvom';\n\nconst mvisUri = 'http://foo.bar.com';\nconst account = 'demo';\nconst connectOptions = { timeout: 30_000 };\nconst openOptions = { requestId: 'trace' };\n\nconst makeConnection = async (): Connection => {\n  const connection = Connection.createConnection(mvisUri, account, connectOptions);\n  await connection.open(openOptions);\n  return connection;\n};\n\nexport default makeConnection;\n"})}),"\n",(0,s.jsx)(n.h2,{id:"deploying-mvom-database-server-features",children:"Deploying MVOM database server features"}),"\n",(0,s.jsxs)(n.p,{children:["MVOM requires a database server subroutine called ",(0,s.jsx)(n.code,{children:"mvom_main"})," in order to perform its functionality on the database. If ",(0,s.jsx)(n.code,{children:"mvom_main"})," is not available, a connection cannot be established. The connection instance allows for manually deploying this subroutine, which will be cataloged globally for performance considerations. It is recommended to add handling for failed connections due to the subroutine not existing so that it is automatically deployed and the connection retried, but it is up to you when and how to deploy. The ",(0,s.jsx)(n.code,{children:"open"})," method will throw an ",(0,s.jsx)(n.code,{children:"InvalidServerFeaturesError"})," if the subroutine is out of date, and this error can be utilized as a trigger for deploying the subroutine."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax-2",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"deploy(sourceDir: string, options?: DeployOptions)\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters-2",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"sourceDir"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"The directory on the database server where the subroutines will be created"}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"mvom.bp"})})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties-2",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties-2",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"createDir"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsx)(n.td,{children:"Create the directory prior to deploying if it is not present"})]})})]}),"\n",(0,s.jsx)(n.h3,{id:"example-2",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { Connection, InvalidServerFeaturesError } from 'mvom';\nconst mvisUrl = 'http://foo.bar.com';\nconst mvisAdminUrl = 'http://mvis-admin.bar.com';\nconst mvisAdminUsername = 'username';\nconst mvisAdminPassword = 'password';\nconst account = 'demo';\nconst options = { timeout: 30_000 };\nconst sourceDir = 'mvom.bp';\nconst makeConnection = async (): Connection => {\n  const connection = Connection.createConnection(\n    mvisUrl,\n    mvisAdminUrl,\n    mvisAdminUsername,\n    mvisAdminPassword,\n    account,\n    options,\n  );\n  try {\n    await connection.open();\n  } catch (connectionErr) {\n    if (connectionErr instanceof InvalidServerFeaturesError) {\n      // server code is out-of-date - try updating the features\n      await connection.deploy(sourceDir, { createDir: true });\n      await connection.open();\n    } else {\n      // something other than server code being out of date -- rethrow\n      throw connectionErr;\n    }\n  }\n  return connection;\n};\nexport default makeConnection;\n"})}),"\n",(0,s.jsx)(n.h2,{id:"getting-the-current-database-date",children:"Getting the current database date"}),"\n",(0,s.jsxs)(n.p,{children:["Using the connection instance, you can access the database server's current date in ISO 8601 date format (",(0,s.jsx)(n.code,{children:"YYYY-MM-DD"}),")."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax-3",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"getDbDate(options?: GetDbDateOptions): Promise<string>\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters-3",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties-3",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties-3",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"requestId"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"randomly generated UUID"}),(0,s.jsxs)(n.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,s.jsx)(n.code,{children:"X-MVIS-Trace-Id"})]})]})})]}),"\n",(0,s.jsx)(n.h2,{id:"getting-the-current-database-time",children:"Getting the current database time"}),"\n",(0,s.jsxs)(n.p,{children:["Using the connection instance, you can access the database server's current time in ISO 8601 time format (",(0,s.jsx)(n.code,{children:"HH:MM:SS.SSS"}),")."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax-4",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"getDbTime(options?: GetDbTimeOptions): Promise<string>\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters-4",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties-4",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties-4",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"requestId"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"randomly generated UUID"}),(0,s.jsxs)(n.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,s.jsx)(n.code,{children:"X-MVIS-Trace-Id"})]})]})})]}),"\n",(0,s.jsx)(n.h2,{id:"getting-the-current-database-date-time",children:"Getting the current database date-time"}),"\n",(0,s.jsxs)(n.p,{children:["Using the connection instance, you can access the database server's current date-time in ISO 8601 date-time format (",(0,s.jsx)(n.code,{children:"YYYY-MM-DDTHH:MM:SS.SSS"}),")."]}),"\n",(0,s.jsx)(n.h3,{id:"syntax-5",children:"Syntax"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"getDbDateTime(options?: GetDbDateTimeOptions): Promise<string>\n"})}),"\n",(0,s.jsx)(n.h3,{id:"parameters-5",children:"Parameters"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Example"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"options"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"object"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.a,{href:"#options-object-properties-5",children:"Options object"})," (see below)"]}),(0,s.jsx)(n.td,{})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"options-object-properties-5",children:"Options Object Properties"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Property"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"requestId"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"string"})}),(0,s.jsx)(n.td,{children:"randomly generated UUID"}),(0,s.jsxs)(n.td,{children:["A request/trace ID to be passed to MVIS as a request header with the key ",(0,s.jsx)(n.code,{children:"X-MVIS-Trace-Id"})]})]})})]}),"\n",(0,s.jsx)(n.h2,{id:"logger-interface",children:"Logger interface"}),"\n",(0,s.jsx)(n.p,{children:"MVOM allows passing a logger to the connection instance which will have one of its methods executed whenever MVOM logs a message for debugging or error purposes. This logger will then be passed to any classes that require logging. The logger object has the following interface:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"interface Logger {\n  fatal(message: string): void;\n  error(message: string): void;\n  warn(message: string): void;\n  info(message: string): void;\n  debug(message: string): void;\n  trace(message: string): void;\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["Any object implementing the ",(0,s.jsx)(n.code,{children:"Logger"})," interface can be passed as an option when creating the connection. What you choose to do in your methods is totally up to you, but it can be helpful to provide a logger as it will make debugging and diagnosing any errors significantly easier."]}),"\n",(0,s.jsx)(n.h3,{id:"example-3",children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"import { Connection } from 'mvom';\n\nconst logger = {\n  fatal: (message: string) => {\n    console.error(message);\n  },\n  error: (message: string) => {\n    console.error(message);\n  },\n  warn: (message: string) => {\n    console.warn(message);\n  },\n  info: (message: string) => {\n    console.log(message);\n  },\n  debug: (message: string) => {\n    console.log(message);\n  },\n  trace: (message: string) => {\n    console.log(message);\n  },\n};\n\nconst mvisUrl = 'http://foo.bar.com';\nmvisAdminUrl = 'http://mvis-admin.bar.com';\nmvisAdminUsername = 'username';\nmvisAdminPassword = 'password';\nconst account = 'demo';\nconst options = { timeout: 30_000, logger };\n\nconst connection = Connection.createConnection(\n  mvisUrl,\n  mvisAdminUrl,\n  mvisAdminUsername,\n  mvisAdminPassword,\n  account,\n  options,\n);\n"})})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>o});var s=t(6540);const i={},r=s.createContext(i);function c(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);