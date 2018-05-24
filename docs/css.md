## CSS

- [PostCSS](#postcss)
- [CSS Modules](#css-modules)
- [Pre-Processors](#pre-processors)
- [Passing Options to Pre-Processor Loaders](#passing-options-to-pre-processor-loaders)

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

This is preferred over manually tapping into specific loaders, because these options will be shared across all rules that are related to it.
