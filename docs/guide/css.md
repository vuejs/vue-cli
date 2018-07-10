# Working with CSS

Vue CLI projects comes with support for [PostCSS](http://postcss.org/), [CSS Modules](https://github.com/css-modules/css-modules) and pre-processors including [Sass](https://sass-lang.com/), [Less](http://lesscss.org/) and [Stylus](http://stylus-lang.com/).

## Pre-Processors

You can select pre-processors (Sass/Less/Stylus) when creating the project. If you did not do so, the internal webpack config is still pre-configured to handle all of them. You just need to manually install the corresponding webpack loaders:

``` bash
# Sass
npm install -D sass-loader node-sass

# Less
npm install -D less-loader less

# Stylus
npm install -D stylus-loader stylus
```

Then you can import the corresponding file types, or use them in `*.vue` files with:

``` vue
<style lang="scss">
$color = red;
</style>
```

## PostCSS

Vue CLI uses PostCSS internally.

You can configure PostCSS via `.postcssrc` or any config source supported by [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config), and configure [postcss-loader](https://github.com/postcss/postcss-loader) via `css.loaderOptions.postcss` in `vue.config.js`.

The [autoprefixer](https://github.com/postcss/autoprefixer) plugin is enabled by default. To configure the browser targets, use the [browserslist](../guide/browser-compatibility.html#browserslist) field in `package.json`.

::: tip Note on Vendor-prefixed CSS Rules
In the production build, Vue CLI optimizes your CSS and will drop unnecessary vendor-prefixed CSS rules based on your browser targets. With `autoprefixer` enabled by default, you should always use only non-prefixed CSS rules.
:::

## CSS Modules

You can [use CSS Modules in `*.vue` files](https://vue-loader.vuejs.org/en/features/css-modules.html) out of the box with `<style module>`.

To import CSS or other pre-processor files as CSS Modules in JavaScript, the filename should end with `.module.(css|less|sass|scss|styl)`:

``` js
import styles from './foo.module.css'
// works for all supported pre-processors as well
import sassStyles from './foo.module.scss'
```

If you want to drop the `.module` in the filenames, set `css.modules` to `true` in `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  css: {
    modules: true
  }
}
```

If you wish to customize the generated CSS modules class names, you can do so via `css.loaderOptions.css` in `vue.config.js`. All `css-loader` options are supported here, for example `localIdentName` and `camelCase`:

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

## Passing Options to Pre-Processor Loaders

Sometimes you may want to pass options to the pre-processor's webpack loader. You can do that using the `css.loaderOptions` option in `vue.config.js`. For example, to pass some shared global variables to all your Sass styles:

``` js
// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        // @/ is an alias to src/
        // so this assumes you have a file named `src/variables.scss`
        data: `@import "@/variables.scss";`
      }
    }
  }
}
```

Loaders can be configured via `loaderOptions` include:

- [css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-loader](https://github.com/postcss/postcss-loader)
- [sass-loader](https://github.com/webpack-contrib/sass-loader)
- [less-loader](https://github.com/webpack-contrib/less-loader)
- [stylus-loader](https://github.com/shama/stylus-loader)

::: tip
This is preferred over manually tapping into specific loaders using `chainWebpack`, because these options need to be applied in multiple locations where the corresponding loader is used.
:::
