# @vue/cli-plugin-babel

> babel plugin for vue-cli

## Configuration

Uses Babel 7 + `babel-loader` + [@vue/babel-preset-app](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/babel-preset-app) by default, but can be configured via `.babelrc` to use any other Babel presets or plugins.

By default, `babel-loader` is only applied to files inside `src` and `tests` directories. If you wish to explicitly transpile a dependency module, you will need to configure webpack in `vue.config.js`:

``` js
module.exports = {
  chainWebpack: config => {
    config
      .rule('js')
        .include
          .add(/module-to-transpile/)
  }
}
```

## Caching

[cache-loader](https://github.com/webpack-contrib/cache-loader) is enabled by default and cache is stored in `<projectRoot>/node_modules/.cache/cache-loader`.

## Parallelization

[thread-loader](https://github.com/webpack-contrib/thread-loader) is enabled by default when the machine has more than 1 CPU cores. This can be turned off by setting `parallel: false` in `vue.config.js`.

## Installing in an Already Created Project

``` sh
npm install -D @vue/cli-plugin-babel
vue invoke babel
```

## Injected webpack-chain Rules

- `config.rule('js')`
- `config.rule('js').use('babel-loader')`
- `config.rule('js').use('cache-loader')`
- `config.rule('js').use('thread-loader')`
