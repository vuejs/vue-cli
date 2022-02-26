# @vue/cli-plugin-eslint

> eslint plugin for vue-cli

## Injected Commands

- **`vue-cli-service lint`**

  ```
  Usage: vue-cli-service lint [options] [...files]

  Options:

    --format [formatter] specify formatter (default: stylish)
    --no-fix             do not fix errors
    --max-errors         specify number of errors to make build failed (default: 0)
    --max-warnings       specify number of warnings to make build failed (default: Infinity)
    --output-file        specify file to write report to
  ```

Lints and fixes files. If no specific files are given, it lints all files in `src` and `tests`, as well as all JavaScript files in the root directory (these are most often config files such as `babel.config.js` or `.eslintrc.js`).

Other [ESLint CLI options](https://eslint.org/docs/user-guide/command-line-interface#options) are not supported.

::: tip
`vue-cli-service lint` will lint dotfiles `.*.js` by default. If you want to follow ESLint's default behavior instead, consider adding a `.eslintignore` file in your project.
:::

## Configuration

ESLint can be configured via `.eslintrc` or the `eslintConfig` field in `package.json`. See the [ESLint configuration docs](https://eslint.org/docs/user-guide/configuring) for more detail.

::: tip
The following option is under the section of [`vue.config.js`](https://cli.vuejs.org/config/#vue-config-js). It is respected only when `@vue/cli-plugin-eslint` is installed.
:::

Lint-on-save during development with `eslint-loader` is enabled by default. It can be disabled with the `lintOnSave` option in `vue.config.js`:

``` js
module.exports = {
  lintOnSave: false
}
```

When set to `true`, `eslint-loader` will emit lint errors as warnings. By default, warnings are only logged to the terminal and does not fail the compilation.

To make lint errors show up in the browser overlay, you can use `lintOnSave: 'error'`. This will force `eslint-loader` to always emit errors. this also means lint errors will now cause the compilation to fail.

Alternatively, you can configure the overlay to display both warnings and errors:

``` js
// vue.config.js
module.exports = {
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  }
}
```

When `lintOnSave` is a truthy value, `eslint-loader` will be applied in both development and production. If you want to disable `eslint-loader` during production build, you can use the following config:

``` js
// vue.config.js
module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production'
}
```

## Installing in an Already Created Project

```bash
vue add eslint
```

## Injected webpack-chain Rules

- `config.module.rule('eslint')`
- `config.module.rule('eslint').use('eslint-loader')`
