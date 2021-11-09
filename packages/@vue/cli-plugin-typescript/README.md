# @vue/cli-plugin-typescript

> typescript plugin for vue-cli

Uses TypeScript + `ts-loader` + [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin) for faster off-thread type checking.

## Configuration

TypeScript can be configured via `tsconfig.json`.

Since `3.0.0-rc.6`, `typescript` is now a peer dependency of this package, so you can use a specific version of TypeScript by updating your project's `package.json`.

This plugin can be used alongside `@vue/cli-plugin-babel`. When used with Babel, this plugin will output ES2015 and delegate the rest to Babel for auto polyfill based on browser targets.

## Caching

[cache-loader](https://github.com/webpack-contrib/cache-loader) is enabled by default and cache is stored in `<projectRoot>/node_modules/.cache/ts-loader`.

## Parallelization

[thread-loader](https://github.com/webpack-contrib/thread-loader) is enabled by default when the machine has more than 1 CPU cores. This can be turned off by setting `parallel: false` in `vue.config.js`.

`parallel` should be set to `false` when using Typescript in combination with non-serializable loader options, such as regexes, dates and functions. These options would not be passed correctly to `ts-loader` which may lead to unexpected errors.

## Installing in an Already Created Project

```bash
vue add typescript
```

## Injected webpack-chain Rules

- `config.rule('ts')`
- `config.rule('ts').use('ts-loader')`
- `config.rule('ts').use('babel-loader')` (when used alongside `@vue/cli-plugin-babel`)
- `config.rule('ts').use('cache-loader')`
- `config.plugin('fork-ts-checker')`
