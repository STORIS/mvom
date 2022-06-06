---
id: setup_and_configuration
title: Setup and Configuration
---

# Setup and Configuration

In order to communicate to the MultiValue database, the following are required:

1. [Rocket MultiValue Integration Server](https://www.rocketsoftware.com/products/rocket-multivalue-integration-server) (MVIS)
2. Account created, configured, and operational in MVIS for use with the REST server functionality
   - Configuring an account is outside the scope of this documentation. Please consult the Rocket documentation for guidance on configuring an account in MVIS.
3. A REST Server `Subroutine Resource` definition for the MVOM MultiValue server BASIC subroutine configured in MVIS.

:::info
MVOM was created before the MultiValue Integration Server Admin had an API available which allowed for configuration. In a future release, we will look to automate the manual process defined below.
:::

## Configuring the REST Server Subroutine Definition

MVOM requires the existence of a single REST Server `Subroutine Resource` and for the corresponding BASIC subroutine to be deployed to the MultiValue database server. All of the configuration and deployment can be performed using the MVIS Admin software.

You must create a subroutine resource with the following properties:

<figure>

![MVIS Subroutine Definition](/img/subroutine-definition.png)

  <figcaption class="figcaption-docs">Figure 1: Subroutine Details</figcaption>
</figure>

The subroutine has two parameters -- one for input to the subroutine and one for output from the subroutine. The following table shows the setup of those parameters:

| Position | Name     | Parameter Type | Data Type |
| :------: | -------- | -------------- | --------- |
|    1     | `input`  | `input`        | `json`    |
|    2     | `output` | `output`       | `json`    |

The subroutine name must be in the format of `mvom_entry@{{subroutine_version}}` with the `{{subroutine_version}}` being replaced by the version of the subroutine used by your version of MVOM. In the screenshot above, the version is `0.2.0`.

### How to find the subroutine version

The easiest way to find the correct subroutine version is to view the MVOM source on GitHub. Each version of MVOM is tagged on GitHub, so you can use the GitHub navigation to switch to your appropriate version. For example, the link to the latest version is located at https://github.com/STORIS/mvom/blob/main/src/manifest.json.

In the repo's `src` folder, there exists a file named `manifest.json`. This file contains a list of key/value pairing for the MVOM feature and its MultiValue BASIC version. Given this file structure:

```json
{
  "dependencies": {
    "deleteById": "^3.0.0",
    "deploy": "^1.0.0",
    "entry": "^0.2.0",
    "find": "^4.0.0",
    "findById": "^4.0.0",
    "findByIds": "^4.0.0",
    "readFileContentsById": "^1.0.0",
    "getServerInfo": "^1.2.0",
    "save": "^3.0.0",
    "setup": "^1.1.0",
    "teardown": "^1.0.0"
  }
}
```

The version for the `entry` feature is `0.2.0`. This `0.2.0` should replace the `{{subroutine_version}}` in the above format.

## Deploying the REST Server Subroutine Code

The easiest way to deploy the MVOM BASIC source is to use MVIS Admin to deploy it. You can deploy BASIC source through the `Optional Code` tab of the REST Server Subroutine definition.

<figure>

![MVIS Subroutine Source](/img/subroutine-source.png)

  <figcaption class="figcaption-docs">Figure 2: Subroutine Source</figcaption>
</figure>

The following needs to be set:

1. **Source Directory**
   - This can really be anything you want, but we recommend naming the directory `mvom.bp` to ensure your MVOM source code is separate from any other code. Assuming that directory does not exist, you should check the "Create source directory if it doesn't exist" option.
2. Check the **Allow to compile and catalog subroutine code** box
3. **Compile Options**
   - The BASIC source requires the case insensitive compilation flag (`-i`). MVOM recommends compiling with the cross-reference flag (`-d`) and the overwrite flag (`-o`) as well. The full recommendation is to set the compile options to `-i -d -o`.
4. **Source Code**

   - The MVOM distributable downloaded from `npmjs` includes the BASIC source code. To ensure you get the proper version of the code, we suggest opening the file from `node_modules/mvom/unibasic/entry.mvb` and copying and pasting the contents of that file into the source code text area.

   For MVOM release `2.0.0-alpha.6`, the source code is:

```
$basictype 'U'
subroutine mvom_entry(inputSerialized, outputSerialized)
* UDO Status codes:
equ UDO_SUCCESS to 0
equ UDO_ERROR to -1
equ UDO_INVALIDHANDLE to -2

* UDO value types:
equ UDO_FALSE to 0
equ UDO_TRUE to 1
equ UDO_NULL to 2
equ UDO_NUMBER to 3
equ UDO_STRING to 4
equ UDO_ARRAY to 5
equ UDO_OBJECT to 6

* UDO Error codes:
equ UDOERROR_OUTOFMEMORY to 1
equ UDOERROR_INVALIDJSON to 2
equ UDOERROR_NOTSTANDALONE to 3
equ UDOERROR_NOTFOUND to 4
equ UDOERROR_INVALIDNAME to 5
equ UDOERROR_NOTANOBJECT to 6
equ UDOERROR_NOTANARRAY to 7
equ UDOERROR_INVALIDINDEX to 8
equ UDOERROR_OUTOFBOUND to 9
equ UDOERROR_INVALIDOPTION to 10
equ UDOERROR_INVALIDOPTIONVALUE to 11
equ UDOERROR_OPTIONNOTSET to 12
equ UDOERROR_INVALIDFORMAT to 13
equ UDOERROR_INVALIDVALUE to 14
equ UDOERROR_INVALIDTYPE to 15
equ UDOERROR_REFERENCECYCLE to 16
equ UDOERROR_INVALIDXML to 17
equ UDOERROR_DOMAPIFAILURE to 18

* UDO flags:
equ UDOFORMAT_JSON to 0
equ UDOFORMAT_XML to 1

* UDO options:
equ UDOOPTION_UDO2XML_XMLSTYLE to 0
equ UDOOPTION_UDO2XML_NAMESPACE to 1
equ UDOOPTION_OUTPUTMODE to 2
equ UDOOPTION_XML2UDO_INFERNUMBER to 3
equ UDOOPTION_XML2UDO_INFERBOOLEAN to 4
equ UDOOPTION_XML2UDO_INFERNULL to 5
equ UDOOPTION_XML2UDO_EMPTY2NULL to 6
equ UDOOPTION_XML2UDO_TRIMWHITESPACE to 7
equ UDOOPTION_XML2UDO_CASEINSENSITIVE to 8
equ UDOOPTION_XML2UDO_KEEPROOT to 9
equ UDOOPTION_UDO2XML_ROOTNAME to 10
equ UDOOPTION_UDO2XML_NULL2EMPTY to 11
equ UDOOPTION_UDO2XML_NAMESPACEPREFIX to 12

* UDO option values:
equ UDO_XMLSTYLE_ATTR to "ATTRIBUTE"
equ UDO_XMLSTYLE_ELEM to "ELEMENT"
equ UDO_OUTPUT_COMPACT  to "COMPACT"
equ UDO_OUTPUT_FORMATTED  to "FORMATTED"
equ UDO_OPTION_ON to "ON"
equ UDO_OPTION_OFF to "OFF"

* error constants:
equ ERROR_MALFORMED_INPUT to 1
equ ERROR_UNSUPPORTED_ACTION to 2
equ ERROR_DEPLOYMENT to 3
equ ERROR_UDO to 4
equ ERROR_FILE_OPEN to 5
equ ERROR_FILE_CREATE to 6
equ ERROR_RECORD_READ to 7
equ ERROR_RECORD_WRITE to 8
equ ERROR_RECORD_DELETE to 9
equ ERROR_RECORD_VERSION to 10
equ ERROR_RECORD_LOCKED to 11
equ ERROR_QUERY to 12
equ ERROR_DIGEST_HASH to 13
equ ERROR_FOREIGN_KEY to 14
equ ERROR_ENCODE_FILE to 15

* eliminate all terminal output
hush on

* ensure a clean slate
clearselect all
clearsql

* create output object
if udoCreate(UDO_OBJECT, output) then
  * in the event of an error in the creation of the output object, there is little we can do except fatally abort
  return; * returning to caller
end

* create input object
if udoRead(inputSerialized, UDOFORMAT_JSON, input) then
  call error_handler(ERROR_MALFORMED_INPUT, output)
  go response
end

* ensure compact serialized json
if udoSetOption(UDOOPTION_OUTPUTMODE, UDO_OUTPUT_COMPACT) then
  call error_handler(ERROR_UDO, output)
  go response
end

* start main program processing

if udoGetProperty(input, 'action', action, type) then
  call error_handler(ERROR_MALFORMED_INPUT, output)
  go response
end

begin case
  case action eq 'featureList'
    * return the name of all globally cataloged programs that appear to be mvom features
    if udoCreate(UDO_ARRAY, featureList) then
      call error_handler(ERROR_UDO, output)
      go response
    end

    if udoSetProperty(output, 'features', featureList) then
      call error_handler(ERROR_UDO, output)
      go response
    end

    udtexecute 'select CTLGTB with @ID like "mvom..."' returning errmsg
    if @system.return.code lt 0 then
      call error_handler(ERROR_QUERY, output)
      go response
    end
    loop readnext catalogKey else exit
      if udoArrayAppendItem(featureList, catalogKey) then
        call error_handler(ERROR_UDO, output)
        go response
      end
    repeat
  case action eq 'createDir'
    * create a directory (if necessary)
    if udoGetProperty(input, 'dirName', dirName, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    open dirName to f.dirName on error
      call error_handler(ERROR_FILE_OPEN, output)
      go response
    end then
      close f.dirName on error null
    end else
      udtexecute 'create.file dir ':dirName returning errmsg
      if @system.return.code lt 0 then
        call error_handler(ERROR_FILE_CREATE, output)
        go response
      end
    end
  case action eq 'deploy'
    * deploy source code
    if udoGetProperty(input, 'sourceDir', sourceDir, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'source', source, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'programName', programName, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    open sourceDir to f.sourceDir on error
      call error_handler(ERROR_FILE_OPEN, output)
      go response
    end else
      call error_handler(ERROR_FILE_OPEN, output)
      go response
    end

    write source on f.sourceDir, programName on error
      close f.sourceDir on error null
      call error_handler(ERROR_RECORD_WRITE, output)
      go response
    end

    close f.sourceDir on error null

    * compiling with override and case-insensitive flags
    udtexecute 'basic ':sourceDir:' ':programName:' -d -o -i' returning errmsg
    if @system.return.code then
      call error_handler(ERROR_DEPLOYMENT, output)
      go response
    end

    * cataloging with default catalog (global) with force override
    udtexecute 'catalog ':sourceDir:' ':programName:' force' returning errmsg
    if @system.return.code then
      call error_handler(ERROR_DEPLOYMENT, output)
      go response
    end

    if udoSetProperty(output, 'deployed', programName) then
      call error_handler(ERROR_UDO, output)
      go response
    end
  case action eq 'subroutine'
    * call specified subroutine
    if udoGetProperty(input, 'subroutineId', subroutineId, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'options', options, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'setupId', setupId, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'setupOptions', setupOptions, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'teardownId', teardownId, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    if udoGetProperty(input, 'teardownOptions', teardownOptions, type) then
      call error_handler(ERROR_MALFORMED_INPUT, output)
      go response
    end

    call @setupId(setupOptions)

    call @subroutineId(options, output)

    call @teardownId(teardownOptions)
  case 1
    call error_handler(ERROR_UNSUPPORTED_ACTION, output)
    go response
end case

response:
  * if an error occurs in serializing the output object it will likely result in a fatal error
  * there is little else we can do here except let that fatal error occur
  x = udoWrite(output, UDOFORMAT_JSON, outputSerialized)

  * if an error occurs in freeing the memory space for the objects, we will ignore it as there is little else that can be done
  x = udoFree(output)
  x = udoFree(input)

  return; * returning to caller

subroutine error_handler(errorCode, output)

* note that this routine intentionally does not react to udo errors because it could
* potentially result in an unending sequence of errors

x = udoSetProperty(output, 'errorCode', errorCode)

return
```

Upon clicking "OK", MVIS Admin will allow for the source code to be deployed.
