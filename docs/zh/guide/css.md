# 配合 CSS

Vue CLI 项目天生支持 [PostCSS](http://postcss.org/)、[CSS Modules](https://github.com/css-modules/css-modules) 和包含 [Sass](https://sass-lang.com/)、[Less](http://lesscss.org/)、[Stylus](http://stylus-lang.com/) 在内的预处理器。

## 预处理器

你可以在创建项目的时候选择预处理器 (Sass/Less/Stylus)。如果当时没有选好，内置的 webpack 仍然会被预配置为可以完成所有的处理。你也可以手动安装相应的 webpack loader：

``` bash
# Sass
npm install -D sass-loader node-sass

# Less
npm install -D less-loader less

# Stylus
npm install -D stylus-loader stylus
```

然后你就可以导入相应的文件类型，或在 `*.vue` 文件中这样来使用：

``` vue
<style lang="scss">
$color = red;
</style>
```

## PostCSS

Vue CLI 内部使用了 PostCSS。

你可以通过 `.postcssrc` 或任何 [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config) 支持的配置源来配置 PostCSS。也可以通过 `vue.config.js` 中的 `css.loaderOptions.postcss` 配置 [postcss-loader](https://github.com/postcss/postcss-loader)。

我们默认开启了 [autoprefixer](https://github.com/postcss/autoprefixer)。如果要配置目标浏览器，可使用 `package.json` 的 [browserslist](../guide/browser-compatibility.html#browserslist) 字段。

::: tip 关于 CSS 中浏览器前缀规则的注意事项
在生产环境构建中，Vue CLI 会优化 CSS 并基于目标浏览器抛弃不必要的浏览器前缀规则。因为默认开启了 `autoprefixer`，你只使用无前缀的 CSS 规则即可。
:::

## CSS Modules

你可以通过 `<style module>` 以开箱即用的方式[在 `*.vue` 文件中使用 CSS Modules](https://vue-loader.vuejs.org/zh/guide/css-modules.html)。

如果想在 JavaScript 中作为 CSS Modules 导入 CSS 或其它预处理文件，该文件应该以 `.module.(css|less|sass|scss|styl)` 结尾：

``` js
import styles from './foo.module.css'
// 所有支持的预处理器都一样工作
import sassStyles from './foo.module.scss'
```

如果你想去掉文件名中的 `.module`，可以设置 `vue.config.js` 中的 `css.modules` 为 `true`：

``` js
// vue.config.js
module.exports = {
  css: {
    modules: true
  }
}
```

如果你希望自定义生成的 CSS Modules 模块的类名，可以通过 `vue.config.js` 中的 `css.loaderOptions.css` 选项来实现。所有的 `css-loader` 选项在这里都是支持的，例如 `localIdentName` 和 `camelCase`：

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        localIdentName: '[name]-[hash]',
        camelCase: 'only'
      }
    }
  }
}
```

## 向预处理器 Loader 传递选项

有的时候你想要向 webpack 的预处理器 loader 传递选项。你可以使用 `vue.config.js` 中的 `css.loaderOptions` 选项。比如你可以这样向所有 Sass 样式传入共享的全局变量：

``` js
// vue.config.js
const fs = require('fs')

module.exports = {
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      sass: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.scss` 这个文件
        data: `@import "@/variables.scss";`
      }
    }
  }
}
```

Loader 可以通过 `loaderOptions` 配置，包括：

- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)
- [sass-loader](https://github.com/webpack-contrib/sass-loader)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [stylus-loader](https://github.com/shama/stylus-loader)

::: tip 提示
这样做比使用 `chainWebpack` 手动指定 loader 更推荐，因为这些选项需要应用在使用了相应 loader 的多个地方。
:::
