# @vue/cli-plugin-eslint

> eslint plugin for vue-cli

## Injected Commands

- **`vue-cli-service lint`**

  Lints and fixes files in `src` and `test`.

## Configuration

ESLint can be configured via `.eslintrc` or the `eslintConfig` field in `package.json`.

Lint-on-save during development with `eslint-loader` can be enabled with the `lintOnSave` option in `vue.config.js`:

``` js
module.exports = {
  lintOnSave: true
}
```

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-eslint
vue invoke eslint
```

## Injected webpack-chain Rules

- `config.rule('eslint')`
- `config.rule('eslint').use('eslint-loader')`
