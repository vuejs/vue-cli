# Working with Webpack

## Simple Configuration

The easiest way to tweak the webpack config is providing an object to the `configureWebpack` option in `vue.config.js`:

``` js
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      new MyAwesomeWebpackPlugin()
    ]
  }
}
```

The object will be merged into the final webpack config using [webpack-merge](https://github.com/survivejs/webpack-merge).

::: warning
Some webpack options are set based on values in `vue.config.js` and should not be mutated directly. For example, instead of modifying `output.path`, you should use the `outputDir` option in `vue.config.js`; instead of modifying `output.publicPath`, you should use the `publicPath` option in `vue.config.js`. This is because the values in `vue.config.js` will be used in multiple places inside the config to ensure everything works properly together.
:::

If you need conditional behavior based on the environment, or want to directly mutate the config, use a function (which will be lazy evaluated after the env variables are set). The function receives the resolved config as the argument. Inside the function, you can either mutate the config directly, OR return an object which will be merged:

``` js
// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  }
}
```

## Chaining (Advanced)

The internal webpack config is maintained using [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain). The library provides an abstraction over the raw webpack config, with the ability to define named loader rules and named plugins, and later "tap" into those rules and modify their options.

This allows us finer-grained control over the internal config. Below you will see some examples of common modifications done via the `chainWebpack` option in `vue.config.js`.

::: tip
[vue inspect](#inspecting-the-project-s-webpack-config) will be extremely helpful when you are trying to access specific loaders via chaining.
:::

### Modifying Options of a Loader

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .tap(options => {
          // modify the options...
          return options
        })
  }
}
```

::: tip
For CSS related loaders, it's recommended to use [css.loaderOptions](../config/#css-loaderoptions) instead of directly targeting loaders via chaining. This is because there are multiple rules for each CSS file type and `css.loaderOptions` ensures you can affect all rules in one single place.
:::

### Adding a New Loader

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.graphql$/)
      .use('graphql-tag/loader')
        .loader('graphql-tag/loader')
        .end()
      // Add another loader
      .use('other-loader')
        .loader('other-loader')
        .end()
  }
}
```

### Replacing Loaders of a Rule

If you want to replace an existing [Base Loader](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config/base.js), for example using `vue-svg-loader` to inline SVG files instead of loading the file:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear()

    // add replacement loader(s)
    svgRule
      .use('vue-svg-loader')
        .loader('vue-svg-loader')
  }
}
```

### Modifying Options of a Plugin

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        return [/* new args to pass to html-webpack-plugin's constructor */]
      })
  }
}
```

You will need to familiarize yourself with [webpack-chain's API](https://github.com/mozilla-neutrino/webpack-chain#getting-started) and [read some source code](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-service/lib/config) in order to understand how to leverage the full power of this option, but it gives you a more expressive and safer way to modify the webpack config than directly mutate values.

For example, say you want to change the default location of `index.html` from `/Users/username/proj/public/index.html` to `/Users/username/proj/app/templates/index.html`. By referencing [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) you can see a list of options you can pass in. To change our template path we can pass in a new template path with the following config:

``` js
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '/Users/username/proj/app/templates/index.html'
        return args
      })
  }
}
```

You can confirm that this change has taken place by examining the vue webpack config with the `vue inspect` utility, which we will discuss next.

## Inspecting the Project's Webpack Config

Since `@vue/cli-service` abstracts away the webpack config, it may be more difficult to understand what is included in the config, especially when you are trying to make tweaks yourself.

`vue-cli-service` exposes the `inspect` command for inspecting the resolved webpack config. The global `vue` binary also provides the `inspect` command, and it simply proxies to `vue-cli-service inspect` in your project.

The command will print the resolved webpack config to stdout, which also contains hints on how to access rules and plugins via chaining.

You can redirect the output into a file for easier inspection:

```bash
vue inspect > output.js
```
By default, `inspect` command will show the output for development config. To see the production configuration, you need to run

```bash
vue inspect --mode production > output.prod.js
```

Note the output is not a valid webpack config file, it's a serialized format only meant for inspection.

You can also inspect a subset of the config by specifying a path:

```bash
# only inspect the first rule
vue inspect module.rules.0
```

Or, target a named rule or plugin:

```bash
vue inspect --rule vue
vue inspect --plugin html
```

Finally, you can list all named rules and plugins:

```bash
vue inspect --rules
vue inspect --plugins
```

## Using Resolved Config as a File

Some external tools may need access to the resolved webpack config as a file, for example IDEs or command line tools that expect a webpack config path. In that case you can use the following path:

```
<projectRoot>/node_modules/@vue/cli-service/webpack.config.js
```

This file dynamically resolves and exports the exact same webpack config used in `vue-cli-service` commands, including those from plugins and even your custom configurations.
