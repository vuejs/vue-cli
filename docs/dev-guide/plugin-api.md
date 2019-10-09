# Plugin API

## version

Type: `string`

The version string for the `@vue/cli-service` version that is loading the plugin.


## assertVersion

- **Arguments**
  - `{integer | string} range` - a semver range that `@vue/cli-service` needs to satisfy

- **Usage**

  While api.version can be useful in general, it's sometimes nice to just declare your version.
  This API exposes a simple way to do that.

  Nothing happens if the provided version is satisfied. Otherwise, an error will be thrown.

  Note: It's recommended to use [the `peerDependencies` field in `package.json`](https://docs.npmjs.com/files/package.json#peerdependencies) under most circumstances.

## getCwd

- **Usage**:
Returns a current working directory

## resolve

- **Arguments**
  - `{string} path` - relative path from project root

- **Returns**
  - `{string}`- the resolved absolute path

- **Usage**:
Resolve a path for the current project

## hasPlugin

- **Arguments**
  - `{string} id` - plugin id, can omit the (@vue/|vue-|@scope/vue)-cli-plugin- prefix

- **Returns**
  - `{boolean}`

- **Usage**:
Check if the project has a plugin with given id

## registerCommand

- **Arguments**
  - `{string} name`
  - `{object} [opts]`
  ```js
  {
    description: string,
    usage: string,
    options: { [string]: string }
  }
  ```
  - `{function} fn`
  ```js
  (args: { [string]: string }, rawArgs: string[]) => ?Promise
  ```

- **Usage**:
Register a command that will become available as `vue-cli-service [name]`.

## chainWebpack

- **Arguments**
  - `{function} fn`

- **Usage**:
Register a function that will receive a chainable webpack config. This function is lazy and won't be called until `resolveWebpackConfig` is called.


## configureWebpack

- **Arguments**
  - `{object | function} fn`

- **Usage**:
Register a webpack configuration object that will be merged into the config **OR** a function that will receive the raw webpack config. The function can either mutate the config directly or return an object
that will be merged into the webpack config.

## configureDevServer

- **Arguments**
  - `{object | function} fn`

- **Usage**:
Register a dev serve config function. It will receive the express `app` instance of the dev server.

## resolveWebpackConfig

- **Arguments**
  - `{ChainableWebpackConfig} [chainableConfig]`
- **Returns**
  - `{object}` - raw webpack config

- **Usage**:
Resolve the final raw webpack config, that will be passed to webpack.

## resolveChainableWebpackConfig

- **Returns**
  - `{ChainableWebpackConfig}`

- **Usage**:
Resolve an intermediate chainable webpack config instance, which can be further tweaked before generating the final raw webpack config. You can call this multiple times to generate different branches of the base webpack config.

See [https://github.com/mozilla-neutrino/webpack-chain](https://github.com/mozilla-neutrino/webpack-chain)

## genCacheConfig

- **Arguments**
  - `id`
  - `partialIdentifier`
  - `configFiles`
- **Returns**
  - `{object}`
  ```js
  {
    cacheDirectory: string,
    cacheIdentifier: string }
  ```

- **Usage**:
Generate a cache identifier from a number of variables.

