---
sidebar: auto
---

# Configuration Reference

## Global CLI Config

Some global configurations for `@vue/cli`, such as your preferred package manager and your locally saved presets, are stored in a JSON file named `.vuerc` in your home directory. You can edit this file directory with your editor of choice to change the saved options.

## Target Browsers

See the [Browser Compatibility](../guide/browser-compatibility.md#browserslist) section in guide.

## vue.config.js

`vue.config.js` is an optional config file that will be automatically loaded by `@vue/cli-service` if it's present in your project root (next to `package.json`).

The file should export an object containing options:

``` js
// vue.config.js
module.exports = {
  // options...
}
```

::: tip
You can also use the `vue` field in `package.json`, but do note in that case you will be limited to JSON-compatible values only.
:::

### baseUrl

### outputDir

### assetsDir

### lintOnSave

### runtimeCompiler

### transpileDependencies

### productionSourceMap

### configureWebpack

- Type: `Object | Function`

### chainWebpack

- Type: `Function`

### css.modules

### css.extract

### css.sourceMap

### css.loaderOptions

### devServer

- Type: `Object`

  [All options for `webpack-dev-server`](https://webpack.js.org/configuration/dev-server/) are supported. Note that:

  - Some values like `host`, `port` and `https` may be overwritten by command line flags.

  - Some values like `publicPath` and `historyApiFallback` should not be modified as they need to be synchronized with [baseUrl](#baseurl) for the dev server to function properly.

### devServer.proxy

- Type: `string | Object`

  If your frontend app and the backend API server are not running on the same host, you will need to proxy API requests to the API server during development. This is configurable via the `devServer.proxy` option in `vue.config.js`.

  `devServer.proxy` can be a string pointing to the development API server:

  ``` js
  module.exports = {
    devServer: {
      proxy: 'http://localhost:4000'
    }
  }
  ```

  This will tell the dev server to proxy any unknown requests (requests that did not match a static file) to `http://localhost:4000`.

  If you want to have more control over the proxy behavior, you can also use an object with `path: options` pairs. Consult [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#proxycontext-config) for full options:

  ``` js
  module.exports = {
    devServer: {
      proxy: {
        '/api': {
          target: '<url>',
          ws: true,
          changeOrigin: true
        },
        '/foo': {
          target: '<other_url>'
        }
      }
    }
  }
  ```

### parallel

- Type: `boolean`
- Default: `require('os').cpus().length > 1`

  Whether to use `thread-loader` for Babel or TypeScript transpilation.

### pwa

- Type: `Object`

  Pass options to the [PWA Plugin](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa).

### pluginOptions

- Type: `Object`

  This is an object that doesn't go through any schema validation, so it can be used to pass arbitrary options to 3rd party plugins. For example:

  ``` js
  module.exports = {
    pluginOptions: {
      foo: {
        // plugins can access these options as
        // `options.pluginOptions.foo`.
      }
    }
  }
  ```

## Babel

Babel can be configured via `babel.config.js`.

::: tip
Vue CLI uses `babel.config.js` which is a new config format in Babel 7. Unlike `.babelrc` or the `babel` field in `package.json`, this config file does not use a file-location based resolution, and is applied consistently to any file under project root, including dependencies inside `node_modules`. It is recommended to always use `babel.config.js` instead of other formats in Vue CLI projects.
:::

All Vue CLI apps use `@vue/babel-preset-app`, which includes `babel-preset-env`, JSX support and optimized configuration for minimal bundle size overhead. See [its docs](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app) for details and preset options.

Also see the [Polyfills](../guide/browser-compatibility.md#polyfills) section in guide.

## ESLint

ESLint can be configured via `.eslintrc` or `eslintConfig` field in `package.json`.

See [@vue/cli-plugin-eslint](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint) for more details.

## TypeScript

TypeScript can be configured via `tsconfig.json`.

See [@vue/cli-plugin-typescript](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript) for more details.

## Unit Testing

### Jest

See [@vue/cli-plugin-unit-jest](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest) for more details.

### Mocha (via `mocha-webpack`)

See [@vue/cli-plugin-unit-mocha](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha) for more details.

## E2E Testing

### Cypress

See [@vue/cli-plugin-e2e-cypress](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress) for more details.

### Nightwatch

See [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch) for more details.
