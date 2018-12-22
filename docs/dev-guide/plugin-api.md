# Plugin API

## getCwd

- **Usage**:
Returns a current working directory

## resolve

- **Arguments**
  - `{string} _path` - relative path from project root

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

- **Example**

```js
if (api.hasPlugin('typescript')) {
  console.log('This project is using TypeScript')
}
```

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

- **Example**
```js
api.registerCommand(
  'greet',
  {
    description: 'Writes a greeting to the console',
    usage: 'vue-cli-service greet'
  },
  () => {
    console.log(`👋  Hello`)
  }
)
```

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

