# @vue/cli-plugin-eslint

> eslint plugin for vue-cli

## Injected Commands

- **`vue-cli-service lint`**

  ```
  Usage: vue-cli-service lint [options] [...files]

  Options:

    --format [formatter] specify formatter (default: codeframe)
    --no-fix             do not fix errors
    --max-errors         specify number of errors to make build failed (default: 0)
    --max-warnings       specify number of warnings to make build failed (default: Infinity)
  ```

  Lints and fixes files. If no specific files are given, it lints all files in `src` and `test`.

  Other [ESLint CLI options](https://eslint.org/docs/user-guide/command-line-interface#options) are also supported.

## Configuration

ESLint can be configured via `.eslintrc` or the `eslintConfig` field in `package.json`.

Lint-on-save during development with `eslint-loader` is enabled by default. It can be disabled with the `lintOnSave` option in `vue.config.js`:

``` js
module.exports = {
  lintOnSave: false
}
```

## Installing in an Already Created Project

``` sh
vue add @vue/eslint
```

## Injected webpack-chain Rules

- `config.module.rule('eslint')`
- `config.module.rule('eslint').use('eslint-loader')`
