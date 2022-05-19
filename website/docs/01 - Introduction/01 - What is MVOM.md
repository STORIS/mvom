---
id: what_is_mvom
title: What is MVOM?
---

# What is MVOM?

MVOM (**M**ulti**V**alue **O**bject **M**apper) is a library which provides the ability to access Multivalue databases (e.g. [Unidata](https://www.rocketsoftware.com/products/rocket-unidata-0), [Universe](https://www.rocketsoftware.com/products/rocket-universe-0)) using applications written for Node.js.

## How it works

MVOM works with the [Rocket MultiValue Integration Server](https://www.rocketsoftware.com/products/rocket-multivalue-integration-server) (MVIS) to proxy requests from your Node.js application to the MultiValue database server. MVIS maintains connectivity to one or more MultiValue database servers and/or accounts using the standard UniRPC protocol and allows client requests from a variety of different protocols. In the case of MVOM, it relies on MVIS' REST server functionality to issue http requests to MVIS which executes UniBasic subroutines on the database server. The responses from these subroutines is then processed by MVOM and returned to the client application.

## Features

- Declarative database schema mapping
- MultiValue to/from Object data transformations
  - String
  - Number
  - Boolean
  - Date
  - Time
  - Date-Time
  - Scalar arrays
  - Associative arrays
- Data Validations
  - Required value validation
  - Foreign key constraint validation
  - Data type validation and coercion
- Database operations
  - Read
  - Write
  - Delete
  - Query
