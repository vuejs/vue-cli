## CSS

- [PostCSS](#postcss)
- [CSS Modules](#css-modules)
- [Pre-Processors](#pre-processors)
- [Passing Options to Pre-Processor Loaders](#passing-options-to-pre-processor-loaders)

### PostCSS

Vue CLI uses PostCSS internally, and enables [autoprefixer](https://github.com/postcss/autoprefixer) by default. You can configure PostCSS via `.postcssrc` or any config source supported by [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config).

### CSS Modules

You can [use CSS Modules in `*.vue` files](https://vue-loader.vuejs.org/en/features/css-modules.html) out of the box with `<style module>`.

As for standalone style files, any files ending with `.module.(css|sass|scss|less|styl|stylus)` will be processed as CSS modules.

If you wish to be able to use CSS modules without the `.module` postfix, you can set `css: { modules: true }` in `vue.config.js`. This option does not affect `*.vue` files.

If you wish to customize the CSS modules class name output you can set the `css: { localIdentName: [name]__[local]--[hash:base64:5]}` in `vue.config.js`.

### Pre-Processors

You can select pre-processors (Sass/Less/Stylus) when creating the project. If you did not do so, you can also just manually install the corresponding webpack loaders. The loaders are pre-configured and will automatically be picked up. For example, to add Sass to an existing project, simply run:

``` sh
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
