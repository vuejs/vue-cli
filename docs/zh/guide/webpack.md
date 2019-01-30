# webpack 相关

## 简单的配置方式

调整 webpack 配置最简单的方式就是在 `vue.config.js` 中的 `configureWebpack` 选项提供一个对象：

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

该对象将会被 [webpack-merge](https://github.com/survivejs/webpack-merge) 合并入最终的 webpack 配置。

::: warning 警告
有些 webpack 选项是基于 `vue.config.js` 中的值设置的，所以不能直接修改。例如你应该修改 `vue.config.js` 中的 `outputDir` 选项而不是修改 `output.path`；你应该修改 `vue.config.js` 中的 `publicPath` 选项而不是修改 `output.publicPath`。这样做是因为 `vue.config.js` 中的值会被用在配置里的多个地方，以确保所有的部分都能正常工作在一起。
:::

如果你需要基于环境有条件地配置行为，或者想要直接修改配置，那就换成一个函数 (该函数会在环境变量被设置之后懒执行)。该方法的第一个参数会收到已经解析好的配置。在函数内，你可以直接修改配置，或者返回一个将会被合并的对象：

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
    } else {
      // 为开发环境修改配置...
    }
  }
}
```

## 链式操作 (高级)

Vue CLI 内部的 webpack 配置是通过 [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) 维护的。这个库提供了一个 webpack 原始配置的上层抽象，使其可以定义具名的 loader 规则和具名插件，并有机会在后期进入这些规则并对它们的选项进行修改。

它允许我们更细粒度的控制其内部配置。接下来有一些常见的在 `vue.config.js` 中的 `chainWebpack` 修改的例子。

::: tip 提示
当你打算链式访问特定的 loader 时，[vue inspect](#审查项目的-webpack-配置) 会非常有帮助。
:::

### 修改 Loader 选项

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          // 修改它的选项...
          return options
        })
  }
}
```

::: tip 提示
对于 CSS 相关 loader 来说，我们推荐使用 [css.loaderOptions](../config/#css-loaderoptions) 而不是直接链式指定 loader。这是因为每种 CSS 文件类型都有多个规则，而 `css.loaderOptions` 可以确保你通过一个地方影响所有的规则。
:::

### 添加一个新的 Loader

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

### 替换一个规则里的 Loader

如果你想要替换一个已有的[基础 loader](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js)，例如为内联的 SVG 文件使用 `vue-svg-loader` 而不是加载这个文件：

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear()

    // 添加要替换的 loader
    svgRule
      .use('vue-svg-loader')
        .loader('vue-svg-loader')
  }
}
```

### 修改插件选项

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* 传递给 html-webpack-plugin's 构造函数的新参数 */]
      })
  }
}
```

你需要熟悉 [webpack-chain 的 API](https://github.com/mozilla-neutrino/webpack-chain#getting-started) 并[阅读一些源码](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config)以便了解如何最大程度利用好这个选项，但是比起直接修改 webpack 配置，它的表达能力更强，也更为安全。

比方说你想要将 `index.html` 默认的路径从 */Users/username/proj/public/index.html* 改为 */Users/username/proj/app/templates/index.html*。通过参考 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) 你能看到一个可以传入的选项列表。我们可以在下列配置中传入一个新的模板路径来改变它：

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

你可以通过接下来要讨论的工具 **`vue inspect`** 来确认变更。

## 审查项目的 webpack 配置

因为 `@vue/cli-service` 对 webpack 配置进行了抽象，所以理解配置中包含的东西会比较困难，尤其是当你打算自行对其调整的时候。

`vue-cli-service` 暴露了 `inspect` 命令用于审查解析好的 webpack 配置。那个全局的 `vue` 可执行程序同样提供了 `inspect` 命令，这个命令只是简单的把 `vue-cli-service inspect` 代理到了你的项目中。

该命令会将解析出来的 webpack 配置、包括链式访问规则和插件的提示打印到 stdout。

你可以将其输出重定向到一个文件以便进行查阅：

``` bash
vue inspect > output.js
```

注意它输出的并不是一个有效的 webpack 配置文件，而是一个用于审查的被序列化的格式。

你也可以通过指定一个路径来审查配置的一小部分：

``` bash
# 只审查第一条规则
vue inspect module.rules.0
```

或者指向一个规则或插件的名字：

``` bash
vue inspect --rule vue
vue inspect --plugin html
```

最后，你可以列出所有规则和插件的名字：

``` bash
vue inspect --rules
vue inspect --plugins
```

## 以一个文件的方式使用解析好的配置

有些外部工具可能需要通过一个文件访问解析好的 webpack 配置，比如那些需要提供 webpack 配置路径的 IDE 或 CLI。在这种情况下你可以使用如下路径：

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

该文件会动态解析并输出 `vue-cli-service` 命令中使用的相同的 webpack 配置，包括那些来自插件甚至是你自定义的配置。
