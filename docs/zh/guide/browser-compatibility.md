# 浏览器兼容性

## browserslist

你会发现有 `package.json` 文件里的 `browserslist` 字段 (或一个单独的 `.browserslistrc` 文件)，指定了项目的目标浏览器的范围。这个值会被 [@babel/preset-env][babel-preset-env] 和 [Autoprefixer][autoprefixer] 用来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀。

现在查阅[这里][browserslist]了解如何指定浏览器范围。

## Polyfill

### useBuiltIns: 'usage'

一个默认的 Vue CLI 项目会使用 [@vue/babel-preset-app][babel-preset-app]，它通过 `@babel/preset-env` 和 `browserslist` 配置来决定项目需要的 polyfill。

默认情况下，它会把 [`useBuiltIns: 'usage'`](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) 传递给 `@babel/preset-env`，这样它会根据源代码中出现的语言特性自动检测需要的 polyfill。这确保了最终包里 polyfill 数量的最小化。然而，这也意味着**如果其中一个依赖需要特殊的 polyfill，默认情况下 Babel 无法将其检测出来。**

如果有依赖需要 polyfill，你有几种选择：

1. **如果该依赖基于一个目标环境不支持的 ES 版本撰写:** 将其添加到 `vue.config.js` 中的 [`transpileDependencies`](../config/#transpiledependencies) 选项。这会为该依赖同时开启语法转换和根据使用情况检测 polyfill。

2. **如果该依赖交付了 ES5 代码并显式地列出了需要的 polyfill:** 你可以使用 `@vue/babel-preset-app` 的 [polyfills](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#polyfills) 选项预包含所需要的 polyfill。**注意 `es6.promise` 将被默认包含，因为现在的库依赖 Promise 是非常普遍的。**

    ``` js
    // babel.config.js
    module.exports = {
      presets: [
        ['@vue/app', {
          polyfills: [
            'es6.promise',
            'es6.symbol'
          ]
        }]
      ]
    }
    ```

    ::: tip 提示
    我们推荐以这种方式添加 polyfill 而不是在源代码中直接导入它们，因为如果这里列出的 polyfill 在 `browserslist` 的目标中不需要，则它会被自动排除。
    :::

3. **如果该依赖交付 ES5 代码，但使用了 ES6+ 特性且没有显式地列出需要的 polyfill (例如 Vuetify)：**请使用 `useBuiltIns: 'entry'` 然后在入口文件添加 `import '@babel/polyfill'`。这会根据 `browserslist` 目标导入**所有** polyfill，这样你就不用再担心依赖的 polyfill 问题了，但是因为包含了一些没有用到的 polyfill 所以最终的包大小可能会增加。

更多细节可查阅 [@babel-preset/env 文档](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage)。

### 构建库或是 Web Component 时的 Polyfills

当使用 Vue CLI 来[构建一个库或是 Web Component](./build-targets.md) 时，推荐给 `@vue/babel-preset-env` 传入 `useBuiltIns: false` 选项。这能够确保你的库或是组件不包含不必要的 polyfills。通常来说，打包 polyfills 应当是最终使用你的库的应用的责任。

## 现代模式

有了 Babel 我们可以兼顾所有最新的 ES2015+ 语言特性，但也意味着我们需要交付转译和 polyfill 后的包以支持旧浏览器。这些转译后的包通常都比原生的 ES2015+ 代码会更冗长，运行更慢。现如今绝大多数现代浏览器都已经支持了原生的 ES2015，所以因为要支持更老的浏览器而为它们交付笨重的代码是一种浪费。

Vue CLI 提供了一个“现代模式”帮你解决这个问题。以如下命令为生产环境构建：

``` bash
vue-cli-service build --modern
```

Vue CLI 会产生两个应用的版本：一个现代版的包，面向支持 [ES modules](https://jakearchibald.com/2017/es-modules-in-browsers/) 的现代浏览器，另一个旧版的包，面向不支持的旧浏览器。

最酷的是这里没有特殊的部署要求。其生成的 HTML 文件会自动使用 [Phillip Walton 精彩的博文](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)中讨论到的技术：

- 现代版的包会通过 `<script type="module">` 在被支持的浏览器中加载；它们还会使用 `<link rel="modulepreload">` 进行预加载。

- 旧版的包会通过 `<script nomodule>` 加载，并会被支持 ES modules 的浏览器忽略。

- 一个针对 Safari 10 中 `<script nomodule>` 的修复会被自动注入。

对于一个 Hello World 应用来说，现代版的包已经小了 16%。在生产环境下，现代版的包通常都会表现出显著的解析速度和运算速度，从而改善应用的加载性能。

::: tip 提示
`<script type="module">` [需要配合始终开启的 CORS 进行加载](https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors)。这意味着你的服务器必须返回诸如 `Access-Control-Allow-Origin: *` 的有效的 CORS 头。如果你想要通过认证来获取脚本，可使将 [crossorigin](../config/#crossorigin) 选项设置为 `use-credentials`。

同时，现代浏览器使用一段内联脚本来避免 Safari 10 重复加载脚本包，所以如果你在使用一套严格的 CSP，你需要这样显性地允许内联脚本：

```
Content-Security-Policy: script-src 'self' 'sha256-4RS22DYeB7U14dra4KcQYxmwt5HkOInieXK1NUMBmQI='
```
:::

[autoprefixer]: https://github.com/postcss/autoprefixer
[babel-preset-env]: https://new.babeljs.io/docs/en/next/babel-preset-env.html
[babel-preset-app]: https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app
[browserslist]: https://github.com/ai/browserslist
