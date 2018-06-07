---
sidebar: auto
---

# Configuration Reference

## ~/.vuerc

## vue.config.js

Here are all the available options with default values (all optional):

``` js
module.exports = {
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'
  baseUrl: '/',

  // where to output built files
  outputDir: 'dist',

  // where to put static assets (js/css/img/font/...)
  assetsDir: '',

  // whether to use eslint-loader for lint on save.
  // valid values: true | false | 'error'
  // when set to 'error', lint errors will cause compilation to fail.
  lintOnSave: true,

  // use the full build with in-browser compiler?
  // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
  runtimeCompiler: false,

  // babel-loader skips `node_modules` deps by default.
  // explicitly transpile a dependency with this option.
  transpileDependencies: [/* string or regex */],

  // generate sourceMap for production build?
  productionSourceMap: true,

  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: () => {},
  configureWebpack: () => {},

  // CSS related options
  css: {
    // extract CSS in components into a single CSS file (only in production)
    // can also be an object of options to pass to extract-text-webpack-plugin
    extract: true,

    // enable CSS source maps?
    sourceMap: false,

    // pass custom options to pre-processor loaders. e.g. to pass options to
    // sass-loader, use { sass: { ... } }
    loaderOptions: {},

    // Enable CSS modules for all css / pre-processor files.
    // This option does not affect *.vue files.
    modules: false
  },

  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require('os').cpus().length > 1,

  // options for the PWA plugin.
  // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {},

  // configure webpack-dev-server behavior
  devServer: {
    open: process.platform === 'darwin',
    disableHostCheck: false,
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#configuring-proxy
    proxy: null, // string | Object
    before: app => {}
  },

  // options for 3rd party plugins
  pluginOptions: {
    // ...
  }
}
```

## webpack

### Basic Configuration

The easiest way to tweak the webpack config is provide an object to the `configureWebpack` option in `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      new MyAwesomeWebpackPlugin()
    ]
  }
}
```

The object will be merged into the final webpack config using [webpack-merge](https://github.com/survivejs/webpack-merge).

If you need conditional behavior based on the environment, or want to directly mutate the config, use a function (which will be lazy evaluated after the env variables are set). The function receives the resolved config as the argument. Inside the function, you can either mutate the config directly, OR return an object which will be merged:

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
}
```

### Chaining (Advanced)

The internal webpack config is maintained using [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). The library provides an abstraction over the raw webpack config, with the ability to define named loader rules and named plugins, and later "tap" into those rules and modify their options.

This allows us finer-grained control over the internal config. Here are some examples:

#### Transpiling a Dependency Module

By default the Babel configuration skips

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('js')
        .include
          .add(/some-module-to-transpile/)
  }
}
```

#### Modifying Loader Options

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('scss')
      .use('sass-loader')
      .tap(options =>
        merge(options, {
          includePaths: [path.resolve(__dirname, 'node_modules')],
        })
      )
  }
}
```

#### Adding a new loader example

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
        .loader('graphql-tag/loader')
        .end()
  }
}
```

#### Replace existing Base Loader

If you want to replace an existing [Base Loader](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js), for example using `vue-svg-loader` to inline SVG files instead of loading the file:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
        .loader('vue-svg-loader')
  }
}
```

#### Modifying Plugin Options

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* new args to pass to html-webpack-plugin's constructor */]
      })
  }
}
```

You will need to familiarize yourself with [webpack-chain's API](https://github.com/mozilla-neutrino/webpack-chain#getting-started) and [read some source code](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) in order to understand how to leverage the full power of this option, but it gives you a more expressive and safer way to modify the webpack config than directly mutation values.

For example, say you want to change the default location of `index.html` from `/Users/username/proj/public/index.html` to `/Users/username/proj/app/templates/index.html`. By referencing [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) you can see a list of options you can pass in. To change our template path we can pass in a new template path with the following config:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '/Users/username/proj/app/templates/index.html'
        return args
      })
  }
}
```

You can confirm that this change has taken place by examining the vue webpack config with the `vue inspect` utility, which we will discuss next.

### Inspecting the Project's Webpack Config

Since `@vue/cli-service` abstracts away the webpack config, it may be more difficult to understand what is included in the config, especially when you are trying to make tweaks yourself.

`vue-cli-service` exposes the `inspect` command for inspecting the resolved webpack config. The global `vue` binary also provides the `inspect` command, and it simply proxies to `vue-cli-service inspect` in your project.

The command prints to stdout by default, so you can redirect that into a file for easier inspection:

``` bash
vue inspect > output.js
```

Note the output is not a valid webpack config file, it's a serialized format only meant for inspection.

You can also inspect a certain path of the config to narrow it down:

``` bash
# only inspect the first rule
vue inspect module.rules.0
```

### Using Resolved Config as a File

Some external tools may need access to the resolved webpack config as a file, for example IDEs or command line tools that expects a webpack config path. In that case you can use the following path:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

This file dynamically resolves and exports the exact same webpack config used in `vue-cli-service` commands, including those from plugins and even your custom configurations.

## CSS

Vue CLI projects comes with support for [PostCSS](http://postcss.org/), [CSS Modules](https://github.com/css-modules/css-modules) and pre-processors including [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) and [Stylus](http://stylus-lang.com/).

### PostCSS

Vue CLI uses PostCSS internally, and enables [autoprefixer](https://github.com/postcss/autoprefixer) by default. You can configure PostCSS via `.postcssrc` or any config source supported by [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config).

### CSS Modules

You can [use CSS Modules in `*.vue` files](https://vue-loader.vuejs.org/en/features/css-modules.html) out of the box with `<style module>`.

To import CSS or other pre-processor files as CSS Modules in JavaScript, the filename should end with `.module.(css|less|sass|scss|styl)`:

``` js
import styles from './foo.module.css'
// works for all supported pre-processors as well
import sassStyles from './foo.module.scss'
```

Alternatively, you can import a file explicitly with a `?module` resourceQuery so that you can drop the `.module` in the filename:

``` js
import styles from './foo.css?module'
// works for all supported pre-processors as well
import sassStyles from './foo.scss?module'
```

If you wish to customize the generated CSS modules class names, you can do so via the `css.localIdentName` option in `vue.config.js`.

### Pre-Processors

You can select pre-processors (Sass/Less/Stylus) when creating the project. If you did not do so, you can also just manually install the corresponding webpack loaders. The loaders are pre-configured and will automatically be picked up. For example, to add Sass to an existing project, simply run:

``` bash
npm install -D sass-loader node-sass
```

Then you can import `.scss` files, or use it in `*.vue` files with:

``` vue
<style lang="scss">
$color = red;
</style>
```

### Passing Options to Pre-Processor Loaders

Sometimes you may want to pass options to the pre-processor's webpack loader. You can do that using the `css.loaderOptions` option in `vue.config.js`. For example, to pass some shared global variables to all your Sass styles:

``` js
// vue.config.js
const fs = require('fs')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: fs.readFileSync('src/variables.scss', 'utf-8')
      }
    }
  }
}
```

This is preferred over manually tapping into specific loaders, because these options will be shared across all rules that are related to it.

## browserslist

You will notice a `browserslist` field in `package.json` specifying a range of browsers the project is targeting. This value will be used by `babel-preset-env` and `autoprefixer` to automatically determine the JavaScript polyfills and CSS vendor prefixes needed.

See [here](https://github.com/ai/browserslist) for how to specify browser ranges.

## Dev Server

`vue-cli-service serve` starts a dev server based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server). It comes with hot-module-replacement (HMR) out of the box.

You can configure the dev server's behavior using the `devServer` option in `vue.config.js`:

``` js
module.exports = {
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null, // string | Object
    before: app => {
      // app is an express instance
    }
  }
}
```

In addition to these default values, [all options for `webpack-dev-server`](https://webpack.js.org/configuration/dev-server/) are also supported.

### Configuring Proxy

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

## Babel

Babel can be configured via `.babelrc` or the `babel` field in `package.json`.

All Vue CLI apps use `@vue/babel-preset-app`, which includes `babel-preset-env`, JSX support and optimized configuration for minimal bundle size overhead. See [its docs](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app) for details and preset options.

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
