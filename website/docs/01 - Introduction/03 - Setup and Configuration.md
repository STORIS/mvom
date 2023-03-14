---
id: setup_and_configuration
title: Setup and Configuration
---

# Setup and Configuration

In order to communicate to the MultiValue database, the following are required:

1. [Rocket MultiValue Integration Server](https://www.rocketsoftware.com/products/rocket-multivalue-integration-server) (MVIS)
2. Account created, configured, and operational in MVIS for use with the REST server functionality
   - Configuring an account is outside the scope of this documentation. Please consult the Rocket documentation for guidance on configuring an account in MVIS.

## The `mvom_main` Subroutine

MVOM will automatically create a REST subroutine definition and deploy the subroutine to the database server if not present. The created subroutine definition is named `mvom_main` and is suffixed by an 8 character hash of the bundled source code. A new version of MVOM will result in a new hash and associated subroutine deployment.
