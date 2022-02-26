# Working with CSS

Vue CLI projects come with support for [PostCSS](http://postcss.org/), [CSS Modules](https://github.com/css-modules/css-modules) and pre-processors including [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) and [Stylus](http://stylus-lang.com/).

## Referencing Assets

All compiled CSS are processed by [css-loader](https://github.com/webpack-contrib/css-loader), which parses `url()` and resolves them as module requests. This means you can refer to assets using relative paths based on the local file structure. Note if you want to reference a file inside an npm dependency or via webpack alias, the path must be prefixed with `~` to avoid ambiguity. See [Static Asset Handling](./html-and-static-assets.md#static-assets-handling) for more details.

## Pre-Processors

You can select pre-processors (Sass/Less/Stylus) when creating the project. If you did not do so, the internal webpack config is still pre-configured to handle all of them. You just need to manually install the corresponding webpack loaders:

```bash
# Sass
npm install -D sass-loader sass

# Less
npm install -D less-loader less

# Stylus
npm install -D stylus-loader stylus
```

::: tip Note on webpack 4
When using `webpack` version 4, the default in Vue CLI 4, you need to make sure your loaders are compatible with it. Otherwise you will get errors about confliciting peer dependencies. In this case you can use an older version of the loader that is still compatible with `webpack` 4.

``` bash
# Sass
npm install -D sass-loader@^10 sass
```
:::
 
Then you can import the corresponding file types, or use them in `*.vue` files with:

``` vue
<style lang="scss">
$color: red;
</style>
```

::: tip A Tip on Sass Performance
Note that when using Dart Sass, **synchronous compilation is twice as fast as asynchronous compilation** by default, due to the overhead of asynchronous callbacks. To avoid this overhead, you can use the [fibers](https://www.npmjs.com/package/fibers) package to call asynchronous importers from the synchronous code path. To enable this, simply install `fibers` as a project dependency:
```
npm install -D fibers
```
Please also be aware, as it's a native module, there may be compatibility issues vary on the OS and build environment. In that case, please run `npm uninstall -D fibers` to fix the problem.
:::

### Automatic imports

If you want to automatically import files (for colors, variables, mixins...), you can use the [style-resources-loader](https://github.com/yenshih/style-resources-loader). Here is an example for stylus that imports `./src/styles/imports.styl` in every SFC and every stylus files:

```js
// vue.config.js
const path = require('path')

module.exports = {
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)))
  },
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/styles/imports.styl'),
      ],
    })
}
```

You can also use the [vue-cli-plugin-style-resources-loader](https://www.npmjs.com/package/vue-cli-plugin-style-resources-loader).

## PostCSS

Vue CLI uses PostCSS internally.

You can configure PostCSS via `.postcssrc` or any config source supported by [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), and configure [postcss-loader](https://github.com/postcss/postcss-loader) via `css.loaderOptions.postcss` in `vue.config.js`.

The [autoprefixer](https://github.com/postcss/autoprefixer) plugin is enabled by default. To configure the browser targets, use the [browserslist](../guide/browser-compatibility.html#browserslist) field in `package.json`.

::: tip Note on Vendor-prefixed CSS Rules
In the production build, Vue CLI optimizes your CSS and will drop unnecessary vendor-prefixed CSS rules based on your browser targets. With `autoprefixer` enabled by default, you should always use only non-prefixed CSS rules.
:::

## CSS Modules

You can [use CSS Modules in `*.vue` files](https://vue-loader.vuejs.org/en/features/css-modules.html) out of the box with `<style module>`.

To import CSS or other pre-processor files as CSS Modules in JavaScript, the filename should end with `.module(s).(css|less|sass|scss|styl)`:

``` js
import styles from './foo.module.css'
// works for all supported pre-processors as well
import sassStyles from './foo.module.scss'
```

If you want to drop the `.module` in the file names and treat all style files as CSS Modules, you need to configure the `css-loader` option as follows:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        modules: {
          auto: () => true
        }
      }
    }
  }
}
```

If you wish to customize the generated CSS Modules class names, you can do so via `css.loaderOptions.css` in `vue.config.js`, too. All `css-loader` options are supported here:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      css: {
        // Note: the following config format is different between different Vue CLI versions
        // See the corresponding css-loader documentation for more details.
        // Vue CLI v3 uses css-loader v1: https://www.npmjs.com/package/css-loader/v/1.0.1
        // Vue CLI v4 uses css-loader v3: https://www.npmjs.com/package/css-loader/v/3.6.0
        // Vue CLI v5 uses css-loader v5: https://github.com/webpack-contrib/css-loader#readme
        modules: {
          localIdentName: '[name]-[hash]'
          exportLocalsConvention: 'camelCaseOnly'
        }
      }
    }
  }
}
```

## Passing Options to Pre-Processor Loaders

Sometimes you may want to pass options to the pre-processor's webpack loader. You can do that using the `css.loaderOptions` option in `vue.config.js`. For example, to pass some shared global variables to all your Sass/Less styles:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      // @/ is an alias to src/
      // so this assumes you have a file named `src/variables.sass`
      // Note: this option is named as "prependData" in sass-loader v8
      sass: {
        additionalData: `@import "~@/variables.sass"`
      },
      // by default the `sass` option will apply to both syntaxes
      // because `scss` syntax is also processed by sass-loader underlyingly
      // but when configuring the `prependData` option
      // `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
      // in that case, we can target the `scss` syntax separately using the `scss` option
      scss: {
        additionalData: `@import "~@/variables.scss";`
      },
      // pass Less.js Options to less-loader
      less:{
        // http://lesscss.org/usage/#less-options-strict-units `Global Variables`
        // `primary` is global variables fields name
        globalVars: {
          primary: '#fff'
        }
      }
    }
  }
}
```

Loaders which can be configured via `loaderOptions` include:

- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)
- [sass-loader](https://github.com/webpack-contrib/sass-loader)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [stylus-loader](https://github.com/shama/stylus-loader)

::: tip
This is preferred over manually tapping into specific loaders using `chainWebpack`, because these options need to be applied in multiple locations where the corresponding loader is used.
:::
