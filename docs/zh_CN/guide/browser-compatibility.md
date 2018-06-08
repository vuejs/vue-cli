# 浏览器兼容性

## browserslist

您会注意到 `package.json` 中的有个 `browserslist` 字段，用于目标浏览器。 此值将被 [@babel/preset-env][babel-preset-env] 和 [autoprefixer][autoprefixer] 用于确定需要转译的 JavaScript 特性以及需要的 CSS 供应商前缀。

查看 [这里](browserslist) 来了解如何指定 browserslist 范围。

## Polyfills

默认的 Vue CLI 项目使用 [@vue/babel-preset-app][babel-preset-env]，它使用了 `@babel/preset-env` 和 `browserslist` 配置来确定您的项目所需的 Polyfills。

默认情况下，它将 [`useBuiltIns: 'usage'`](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage) 传递给 `@babel/preset-env`，它会根据您的代码中使用的语言特性来自动检测所需的 polyfills。 这可确保最终的构建中只包含最小的 polyfills。 但是，这也意味着 **如果您的某个依赖对 polyfill 有特定的要求，默认情况下，Babel 将无法检测到它**。

如果您的某个依赖需要 polyfills，您可以有以下几种做法：

1. **如果依赖是用目标环境不支持的 ES 版本编写的：**将该依赖项添加到 `vue.config.js` 中的 [`transpileDependencies`](../ config/#transpiledependencies) 选项。 这将启用对该依赖的语法转换和基于使用情况的 polyfill 检测。

2. **如果依赖使用了 ES5 代码并明确列出了所需的 polyfills：**您可以使用预先包含所需的 [polyfills](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app#polyfills) 选项。 **请注意，默认情况下包含了 `es6.promise` ，因为大多数的库会依赖于 Promises。**

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

    ::: tip
    建议使用这种方式添加 polyfills，而不是直接将它们导入到您的代码中，因为如果您的 `browserslist` 目标不需要它们，则此处列出的 polyfills 可以被自动排除。
    :::

3. **如果依赖使用了 ES5 代码，但使用了 ES6+ 特性却没有明确列出 polyfill 要求（例如Vuetify）：**使用 `useBuiltIns: 'entry'`，然后在您的项目入口文件中添加 `import '@babel/polyfill'`。 这将根据您的 `browserslist` 目标导入 **全部** polyfills，这样您就不必担心依赖的 polyfills 了，但是可能会增加你的最终构建文件大小和一些未使用的 polyfills。

详见 [@babel-preset/env docs](https://new.babeljs.io/docs/en/next/babel-preset-env.html#usebuiltins-usage)。

## 现代模式

> TODO

[autoprefixer]: https://github.com/postcss/autoprefixer
[babel-preset-env]: https://new.babeljs.io/docs/en/next/babel-preset-env.html
[browserslist]: https://github.com/ai/browserslist
