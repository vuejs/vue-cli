---
sidebar: auto
---

# Configuration Reference

<Bit/>

## Global CLI Config

Some global configurations for `@vue/cli`, such as your preferred package manager and your locally saved presets, are stored in a JSON file named `.vuerc` in your home directory. You can edit this file directory with your editor of choice to change the saved options.

## Target Browsers

See the [Browser Compatibility](../guide/browser-compatibility.md#browserslist) section in guide.

## vue.config.js

`vue.config.js` is an optional config file that will be automatically loaded by `@vue/cli-service` if it's present in your project root (next to `package.json`). You can also use the `vue` field in `package.json`, but do note in that case you will be limited to JSON-compatible values only.

The file should export an object containing options:

``` js
// vue.config.js
module.exports = {
  // options...
}
```

### baseUrl

- Type: `string`
- Default: `'/'`

  The base URL your application will be deployed at. By default Vue CLI assumes your app will be deployed at the root of a domain, e.g. `https://www.my-app.com/`. If your app is deployed at a sub-path, you will need to specify that sub-path using this option. For example, if your app is deployed at `https://www.foobar.com/my-app/`, set `baseUrl` to `'/my-app/'`.

  Setting this value correctly is necessary for your static assets to be loaded properly in production.

  This value is also respected during development. If you want your dev server to be served at root instead, you can use a conditional value:

  ``` js
  module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/production-sub-path/'
      : '/'
  }
  ```

  The value can also be set to an empty string (`''`) so that all assets are linked using relative paths, so that the bundle can be used in a file system based environment like a Cordova hybrid app. The caveat is that this will force the generated CSS files to always be placed at the root of the output directory to ensure urls in your CSS work correctly.

  ::: tip
  Always use `baseUrl` instead of modifying webpack `output.publicPath`.
  :::

### outputDir

- Type: `string`
- Default: `'dist'`

  The directory where the production build files will be generated in when running `vue-cli-service build`. Note the target directory will be removed before building (this behavior can be disabled by passing `--no-clean` when building).

  ::: tip
  Always use `outputDir` instead of modifying webpack `output.path`.
  :::

### assetsDir

- Type: `string`
- Default: `''`

  A directory to nest generated static assets (js, css, img, fonts) under.
  
  ::: tip
  `assetsDir` is ignored when overwriting the filename or chunkFilename from the generated assets.
  :::

### pages

- Type: `Object`
- Default: `undefined`

  Build the app in multi-page mode. Each "page" should have a corresponding JavaScript entry file. The value should be an object where the key is the name of the entry, and the value is either:

  - An object that specifies its `entry`, `template` and `filename`;
  - Or a string specifying its `entry`.

  ``` js
  module.exports = {
    pages: {
      index: {
        // entry for the page
        entry: 'src/index/main.js',
        // the source template
        template: 'public/index.html',
        // output as dist/index.html
        filename: 'index.html'
      },
      // when using the entry-only string format,
      // template is inferred to be `public/subpage.html`
      // and falls back to `public/index.html` if not found.
      // Output filename is inferred to be `subpage.html`.
      subpage: 'src/subpage/main.js'
    }
  }
  ```

  ::: tip
  When building in multi-page mode, the webpack config will contain different plugins (there will be multiple instances of `html-webpack-plugin` and `preload-webpack-plugin`). Make sure to run `vue inspect` if you are trying to modify the options for those plugins.
  :::

### lintOnSave

- Type: `boolean | 'error'`
- Default: `true`

  Whether to perform lint-on-save during development using [eslint-loader](https://github.com/webpack-contrib/eslint-loader). This value is respected only when [`@vue/cli-plugin-eslint`](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint) is installed.
  
  When set to `true`, eslint-loader will only emit warnings during webpack's compilation process in order not to break the flow during development. If you want it to emit errors instead (i.e. when building for production), set it like this: `lintOnSave: 'error'`.

### runtimeCompiler

- Type: `boolean`
- Default: `false`

  Whether to use the build of Vue core that includes the runtime compiler. Setting it to `true` will allow you to use the `template` option in Vue components, but will incur around an extra 10kb payload for your app.

  See also: [Runtime + Compiler vs. Runtime only](https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only).

### transpileDependencies

- Type: `Array<string | RegExp>`
- Default: `[]`

  By default `babel-loader` ignores all files inside `node_modules`. If you want to explicitly transpile a dependency with Babel, you can list it in this option.

### productionSourceMap

- Type: `boolean`
- Default: `true`

  Setting this to `false` can speed up production builds if you don't need source maps for production.

### configureWebpack

- Type: `Object | Function`

  If the value is an Object, it will be merged into the final config using [webpack-merge](https://github.com/survivejs/webpack-merge).

  If the value is a function, it will receive the resolved config as the argument. The function can either mutate the config and return nothing, OR return a cloned or merged version of the config.

  See also: [Working with Webpack > Simple Configuration](../guide/webpack.md#simple-configuration)

### chainWebpack

- Type: `Function`

  A function that will receive an instance of `ChainableConfig` powered by [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). Allows for more fine-grained modification of the internal webpack config.

  See also: [Working with Webpack > Chaining](../guide/webpack.md#chaining-advanced)

### css.modules

- Type: `boolean`
- Default: `false`

  By default, only files that ends in `*.module.[ext]` are treated as CSS modules. Setting this to `true` will allow you to drop `.module` in the filenames and treat all `*.(css|scss|sass|less|styl(us)?)` files as CSS modules.

  See also: [Working with CSS > CSS Modules](../guide/css.md#css-modules)

### css.extract

- Type: `boolean`
- Default: `true` (in production mode)

  Whether to extract CSS in your components into a standalone CSS files (instead of inlined in JavaScript and injected dynamically).

  This is also disabled by default when building as web components (styles are inlined and injected into shadowRoot).

  When building as a library, you can also set this to `false` to avoid your users having to import the CSS themselves.

### css.sourceMap

- Type: `boolean`
- Default: `false`

  Whether to enable source maps for CSS. Setting this to `true` may affect build performance.

### css.loaderOptions

- Type: `Object`
- Default: `{}`

  Pass options to CSS-related loaders. For example:

  ``` js
  module.exports = {
    css: {
      loaderOptions: {
        css: {
          // options here will be passed to css-loader
        },
        postcss: {
          // options here will be passed to postcss-loader
        }
      }
    }
  }
  ```

  Supported loaders are:

  - [css-loader](https://github.com/webpack-contrib/css-loader)
  - [postcss-loader](https://github.com/postcss/postcss-loader)
  - [sass-loader](https://github.com/webpack-contrib/sass-loader)
  - [less-loader](https://github.com/webpack-contrib/less-loader)
  - [stylus-loader](https://github.com/shama/stylus-loader)

  See also: [Passing Options to Pre-Processor Loaders](../guide/css.md#passing-options-to-pre-processor-loaders)

  ::: tip
  This is preferred over manually tapping into specific loaders using `chainWebpack`, because these options need to be applied in multiple locations where the corresponding loader is used.
  :::

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

## Example Configurations
### Disable Hashed Filenames
While generated static asset filenames contain a hash to [ensure the browser picks up changed files](https://webpack.js.org/guides/caching/#output-filenames) this can be disabled. One common scenario for this is when integrating Vue with a backend that dictates a code structure other than what Vue CLI generates, such as with WordPress or Laravel. To disable the hashed filenames, the following can be added to `[vue.config.js](https://cli.vuejs.org/config/#vue-config-js)`:


``` js
// vue.config.js
module.exports = {
    chainWebpack: (config) => {
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => Object.assign({}, options, { name: 'img/[name].[ext]' }));
  },
  css: {
    extract: {
      filename: '/css/[name].css',
      chunkFilename: '/css/[name].css',
    },
  },
  configureWebpack: {
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js',
    },
  },
};
```
::: tip
When manually overwriting `filename` or `chunkFilename`, `assetsDir` does not need to be included in their path values.
:::
### Disable Generating index.html
When using Vue CLI with an existing backend, you may need to disable the generation of `index.html` so that they generated assets can be used with another default document. To do so, the following can be added to `[vue.config.js](https://cli.vuejs.org/config/#vue-config-js)`:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
}
```

::: warning
[Modern Mode](https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode) will not work when the `html-webpack-plugin` is disabled.
:::
