---
sidebar: auto
---

# 配置参考

## 全局 CLI 配置

有些针对 `@vue/cli` 的全局配置，例如你惯用的包管理器和你本地保存的 preset，都保存在 home 目录下一个名叫 `.vuerc` 的 JSON 文件。你可以用编辑器直接编辑这个文件来更改已保存的选项。

## 目标浏览器

请查阅指南中的[浏览器兼容性](../guide/browser-compatibility.md#browserslist)章节。

## vue.config.js

`vue.config.js` 是一个可选的配置文件，如果项目的 (和 `package.json` 同级的) 根目录中存在这个文件，那么它会被 `@vue/cli-service` 自动加载。你也可以使用 `package.json` 中的 `vue` 字段，但是注意这种写法需要你严格遵照 JSON 的格式来写。

这个文件应该导出一个包含了选项的对象：

``` js
// vue.config.js
module.exports = {
  // 选项...
}
```

### baseUrl

- Type: `string`
- Default: `'/'`

  部署应用时的基本 URL。默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上，例如 `https://www.my-app.com/`。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 `https://www.my-app.com/my-app/`，则设置 `baseUrl` 为 `/my-app/`。

  你必须正确地设置这个值以使生产环境中静态资源加载正确。

  这个值在开发环境下同样生效。如果你想把开发服务器架设在根路径，你可以使用一个条件式的值：

  ``` js
  module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/production-sub-path/'
      : '/'
  }
  ```

  这个值也可以被设置为空字符串 (`''`) 这样所有的资源都会被链接为相对路径，这样打出来的包可以用在类似 Cordova hybrid 应用的文件系统中。需要注意的生成的 CSS 文件要始终放在输出路径的根部，以确保 CSS 中的 URL 正常工作。

  ::: tip 提示
  请始终使用 `baseUrl` 而不要修改 webpack 的 `output.publicPath`。
  :::

### outputDir

- Type: `string`
- Default: `'dist'`

  当运行 `vue-cli-service build` 时生成的生产环境构建文件的目录。注意目标目录在构建之前会被清除 (构建时传入 `--no-clean` 可关闭该行为)。

  ::: tip 提示
  请始终使用 `outputDir` 而不要修改 webpack 的 `output.path`。
  :::

### assetsDir

- Type: `string`
- Default: `''`

  放置生成的静态资源 (js、css、img、fonts) 的目录。

### pages

- Type: `Object`
- Default: `undefined`

  在 multi-page 模式下构建应用。每个“page”应该有一个对应的 JavaScript 入口文件。其值应该是一个对象，对象的 key 是入口的名字，value 是：

  - 一个指定了 `entry`, `template` 和 `filename` 的对象；
  - 或一个指定其 `entry` 的字符串。

  ``` js
  module.exports = {
    pages: {
      index: {
        // page 的入口
        entry: 'src/index/main.js',
        // 模板来源
        template: 'public/index.html',
        // 在 dist/index.html 的输出
        filename: 'index.html'
      },
      // 当使用只有入口的字符串格式时，
      // 模板会被推导为 `public/subpage.html`
      // 并且如果找不到的话，就回退到 `public/index.html`。
      // 输出文件名会被推导为 `subpage.html`。
      subpage: 'src/subpage/main.js'
    }
  }
  ```

  ::: tip 提示
  当在 multi-page 模式下构建时，webpack 配置会包含不一样的插件 (这时会存在多个 `html-webpack-plugin` 和 `preload-webpack-plugin` 的实例)。如果你试图修改这些插件的选项，请确认运行 `vue inspect`。
  :::

### lintOnSave

- Type: `boolean`
- Default: `true`

  是否在开发环境下通过 [eslint-loader](https://github.com/webpack-contrib/eslint-loader) 在每次保存时 lint 代码。这个值会在 [`@vue/cli-plugin-eslint`](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint) 被安装之后生效。

### runtimeCompiler

- Type: `boolean`
- Default: `false`

  是否使用包含运行时编译器的 Vue 构建版本。设置为 `true` 后你就可以在 Vue 组件中使用 `template` 选项了，但是这会让你的应用额外增加 10kb 左右。

  更多细节可查阅：[Runtime + Compiler vs. Runtime only](https://cn.vuejs.org/v2/guide/installation.html#运行时-编译器-vs-只包含运行时)。

### transpileDependencies

- Type: `Array<string | RegExp>`
- Default: `[]`

  默认情况下 `babel-loader` 会忽略所有 `node_modules` 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。

### productionSourceMap

- Type: `boolean`
- Default: `true`

  如果你不需要生产环境的 source map，可以将其设置为 `false` 以加速生产环境构建。

### configureWebpack

- Type: `Object | Function`

  如果这个值是一个对象，则会通过 [webpack-merge](https://github.com/survivejs/webpack-merge) 合并到最终的配置中。

  如果这个值是一个函数，则会接收被解析的配置作为参数。该函数及可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本。

  更多细节可查阅：[配合 webpack > 简单的配置方式](../guide/webpack.md#简单的配置方式)

### chainWebpack

- Type: `Function`

  是一个函数，会接收一个基于 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 的 `ChainableConfig` 实例。允许对内部的 webpack 配置进行更细粒度的修改。

  更多细节可查阅：[配合 webpack > 链式操作](../guide/webpack.md#链式操作-高级)

### css.modules

- Type: `boolean`
- Default: `false`

  默认情况下，只有 `*.module.[ext]` 结尾的文件才会被视作 CSS Modules 模块。设置为 `true` 后你就可以去掉文件名中的 `.module` 并将所有的 `*.(css|scss|sass|less|styl(us)?)` 文件视为 CSS Modules 模块。

  更多细节可查阅：[配合 CSS > CSS Modules](../guide/css.md#css-modules)

### css.extract

- Type: `boolean`
- Default: `true` (in production mode)

  是否将组件中的 CSS 提取至一个独立的 CSS 文件中 (而不是动态注入到 JavaScript 中的 inline 代码)。

  同样当构建 Web Components 组件时它会默认被禁用 (样式是 inline 的并注入到了 shadowRoot 中)。

  当作为一个库构建时，你也可以将其设置为 `false` 免得用户自己导入 CSS。

### css.sourceMap

- Type: `boolean`
- Default: `false`

  是否为 CSS 开启 source map。设置为 `true` 之后可能会影响构建的性能。

### css.loaderOptions

- Type: `Object`
- Default: `{}`

  向 CSS 相关的 loader 传递选项。例如：

  ``` js
  module.exports = {
    css: {
      loaderOptions: {
        css: {
          // 这里的选项会传递给 css-loader
        },
        postcss: {
          // 这里的选项会传递给 postcss-loader
        }
      }
    }
  }
  ```

  支持的 loader 有：

  - [css-loader](https://github.com/webpack-contrib/css-loader)
  - [postcss-loader](https://github.com/postcss/postcss-loader)
  - [sass-loader](https://github.com/webpack-contrib/sass-loader)
  - [less-loader](https://github.com/webpack-contrib/less-loader)
  - [stylus-loader](https://github.com/shama/stylus-loader)

  更多细节可查阅：[向预处理器 Loader 传递选项](../guide/css.html#向预处理器-loader-传递选项)

  ::: tip 提示
  我们倾向于使用 `chainWebpack` 手动修改指定的 loader，因为这些选项需要同时应用在相应 loader 出现的多个地方。
  :::

### devServer

- Type: `Object`

  [所有 `webpack-dev-server` 的选项](https://webpack.js.org/configuration/dev-server/)都支持。注意：

  - 有些值像 `host`、`port` 和 `https` 可能会被命令行参数覆写。

  - 有些值像 `publicPath` 和 `historyApiFallback` 不应该被修改，因为它们需要和开发服务器的 [baseUrl](#baseurl) 同步以保障正常的工作。

### devServer.proxy

- Type: `string | Object`

  如果你的前端应用和后端 API 服务器没有运行在同一个主机上，你需要在开发环境下将 API 请求代理到 API 服务器。这个问题可以通过 `vue.config.js` 中的 `devServer.proxy` 选项来配置。

  `devServer.proxy` 可以是一个指向开发环境 API 服务器的字符串：

  ``` js
  module.exports = {
    devServer: {
      proxy: 'http://localhost:4000'
    }
  }
  ```

  这会告诉开发服务器将任何未知请求 (没有匹配到静态文件的请求) 代理到`http://localhost:4000`。

  如果你想要更多的代理控制行为，也可以使用一个 `path: options` 成对的对象。完整的选项可以查阅 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware#proxycontext-config) 。

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

  是否为 Babel 或 TypeScript 使用 `thread-loader`。

### pwa

- Type: `Object`

  向 [PWA 插件](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa)传递选项。

### pluginOptions

- Type: `Object`

  这是一个不进行任何 schema 验证的对象，因此它可以用来传递任何第三方插件选项。例如：

  ``` js
  module.exports = {
    pluginOptions: {
      foo: {
        // 插件可以作为 `options.pluginOptions.foo` 访问这些选项。
      }
    }
  }
  ```

## Babel

Babel 可以通过 `babel.config.js` 进行配置。

::: tip
Vue CLI 使用了 Babel 7 中的新配置格式 `babel.config.js`。和 `.babelrc` 或 `package.json` 中的 `babel` 字段不同，这个配置文件不会使用基于文件位置的方案，而是会一致地运用到项目根目录以下的所有文件，包括 `node_modules` 内部的依赖。我们推荐在 Vue CLI 项目中始终使用 `babel.config.js` 取代其它格式。
:::

所有的 Vue CLI 应用都使用 `@vue/babel-preset-app`，它包含了 `babel-preset-env`、JSX 支持以及为最小化包体积优化过的配置。通过[它的文档](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app)可以查阅到更多细节和 preset 选项。

同时查阅指南中的 [Polyfill](../guide/browser-compatibility.md#polyfill) 章节。

## ESLint

ESLint 可以通过 `.eslintrc` 或 `pacakge.json` 中的 `eslintConfig` 字段来配置。

更多细节可查阅 [@vue/cli-plugin-eslint](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint)。

## TypeScript

TypeScript 可以通过 `tsconfig.json` 来配置。

更多细节可查阅 [@vue/cli-plugin-typescript](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript)。

## 单元测试

### Jest

更多细节可查阅 [@vue/cli-plugin-unit-jest](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest)。

### Mocha (配合 `mocha-webpack`)

更多细节可查阅 [@vue/cli-plugin-unit-mocha](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-mocha)。

## E2E 测试

### Cypress

更多细节可查阅 [@vue/cli-plugin-e2e-cypress](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress)。

### Nightwatch

更多细节可查阅 [@vue/cli-plugin-e2e-nightwatch](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-nightwatch)。
