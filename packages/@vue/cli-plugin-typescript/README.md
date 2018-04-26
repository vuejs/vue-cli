# @vue/cli-plugin-typescript

> typescript plugin for vue-cli

Uses TypeScript + `ts-loader` + [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin) for faster off-thread type checking.

## Configuration

TypeScript can be configured via `tsconfig.json`.

This plugin can be used alongside `@vue/cli-plugin-babel`. When used with Babel, this plugin will output ES2015 and delegate the rest to Babel for auto polyfill based on browser targets.

By default, `ts-loader` is only applied to files inside `src` and `tests` directories. If you wish to explicitly transpile a dependency module, you will need to configure webpack in `vue.config.js`:

``` js
module.exports = {
  chainWebpack: config => {
    config
      .module
        .rule('ts')
          .include
            .add(/module-to-transpile/)
  }
}
```

## Injected Commands

If opted to use [TSLint](https://palantir.github.io/tslint/) during project creation, `vue-cli-service lint` will be injected.

## Caching

[cache-loader](https://github.com/webpack-contrib/cache-loader) is enabled by default and cache is stored in `<projectRoot>/node_modules/.cache/cache-loader`.

## Parallelization

[thread-loader](https://github.com/webpack-contrib/thread-loader) is enabled by default when the machine has more than 1 CPU cores. This can be turned off by setting `parallel: false` in `vue.config.js`.

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-typescript
vue invoke typescript
```

## Injected webpack-chain Rules

- `config.rule('ts')`
- `config.rule('ts').use('ts-loader')`
- `config.rule('ts').use('babel-loader')` (when used alongside `@vue/cli-plugin-babel`)
- `config.rule('ts').use('cache-loader')`
- `config.rule('ts').use('thread-loader')`
- `config.plugin('fork-ts-checker')`
