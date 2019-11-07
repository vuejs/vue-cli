# Generator API

## cliVersion

Type: `string`

The version string for the **global** `@vue/cli` version that is invoking the plugin.


## assertCliVersion

- **Arguments**
  - `{integer | string} range` - a semver range that `@vue/cli` needs to satisfy

- **Usage**

  While api.version can be useful in general, it's sometimes nice to just declare your version.
  This API exposes a simple way to do that.

  Nothing happens if the provided version is satisfied. Otherwise, an error will be thrown.


## cliServiceVersion

Type: `string`

The version string for the **project local** `@vue/cli-service` version that is invoking the plugin.


## assertCliServiceVersion

- **Arguments**
  - `{integer | string} range` - a semver range that `@vue/cli-service` needs to satisfy

- **Usage**

  This API exposes a simple way to declare the required project local `@vue/cli-service` version.

  Nothing happens if the provided version is satisfied. Otherwise, an error will be thrown.

  Note: It's recommended to use [the `peerDependencies` field in `package.json`](https://docs.npmjs.com/files/package.json#peerdependencies) under most circumstances.


## resolve

- **Arguments**
  - `{string} ..._paths` - A sequence of relative paths or path segments

- **Returns**
  - `{string}`- the resolved absolute path, caculated based on the current project root

- **Usage**:
Resolve a path for the current project

## hasPlugin

- **Arguments**
  - `{string} id` - plugin id, can omit the (@vue/|vue-|@scope/vue)-cli-plugin- prefix
  - `{string} version` - semver version range, optional

- **Returns**
  - `{boolean}`

- **Usage**:
Check if the project has a plugin with given id. If version range is given, then the plugin version should satisfy it

## addConfigTransform

- **Arguments**
  - `{string} key` - config key in package.json
  - `{object} options` - options
  - `{object} options.file` - file descriptor. Used to search for existing file. Each key is a file type (possible values: ['js', 'json', 'yaml', 'lines']). The value is a list of filenames.
  Example:
  ```js
  {
    js: ['.eslintrc.js'],
    json: ['.eslintrc.json', '.eslintrc']
  }
  ```
  By default, the first filename will be used to create the config file.

- **Returns**
  - `{boolean}`

- **Usage**:
Configure how config files are extracted.

## extendPackage

- **Arguments**
  - `{object | () => object} fields` - fields to merge

- **Usage**:
Extend the `package.json` of the project. Nested fields are deep-merged unless `{ merge: false }` is passed. Also resolves dependency conflicts between plugins. Tool configuration fields may be extracted into standalone files before files are written to disk.

## render

- **Arguments**
  - `{string | object | FileMiddleware} source` - can be one of
    - relative path to a directory;
    - object hash of `{ sourceTemplate: targetFile }` mappings;
    - a custom file middleware function
  - `{object} [additionalData]` - additional data available to templates
  - `{object} [ejsOptions]` - options for ejs

- **Usage**:
Render template files into the virtual files tree object.

## postProcessFiles

- **Arguments**
  - `{FileMiddleware} cb` - file middleware

- **Usage**:
Push a file middleware that will be applied after all normal file middlewares have been applied.

## onCreateComplete

- **Arguments**
  - `{function} cb`

- **Usage**:
Push a callback to be called when the files have been written to disk.

## exitLog

- **Arguments**
  - `{} msg` - string or value to print after the generation is completed;
  - `{('log'|'info'|'done'|'warn'|'error')} [type='log']` - type of the message.

- **Usage**:
Add a message to be printed when the generator exits (after any other standard messages).

## genJSConfig

- **Arguments**
  - `{any} value`

- **Usage**:
Convenience method for generating a JS config file from JSON

## makeJSOnlyValue

- **Arguments**
  - `{any} str` - JS expression as a string

- **Usage**:
Turns a string expression into executable JS for .js config files

## injectImports

- **Arguments**
  - `{string} file` - target file to add imports
  - `{string | [string]} imports` - imports string/array

- **Usage**:
Add import statements to a file.

## injectRootOptions

- **Arguments**
  - `{string} file` - target file to add options
  - `{string | [string]} options` - options string/array

- **Usage**:
Add options to the root Vue instance (detected by `new Vue`).

## entryFile

- **Returns**
  - `{('src/main.ts'|'src/main.js')}`

- **Usage**:
Get the entry file taking into account typescript.

## invoking

- **Returns**
  - `{boolean}`

- **Usage**:
Checks if the plugin is being invoked.
